import express from 'express';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.user._id;
    
    const conversations = await Conversation.find({ participantIds: userId })
      .populate('participantIds', 'displayName email role')
      .sort({ lastMessageAt: -1 });

    return res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/conversations/:conversationId - Get messages in a conversation
router.get('/conversations/:conversationId', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is part of conversation
    if (!conversation.participantIds.includes(req.auth.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'displayName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments({ conversationId });

    return res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages/conversations/:conversationId - Send a message
router.post('/conversations/:conversationId', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, attachmentUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participantIds.includes(req.auth.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = new Message({
      conversationId,
      senderId: req.auth.user._id,
      content: content.trim(),
      attachmentUrl: attachmentUrl || null
    });

    await message.save();
    await message.populate('senderId', 'displayName email role');

    // Update conversation with last message info
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
      $inc: { 'unreadCounts': { [req.auth.user._id.toString()]: 0 } } // Don't increment for sender
    });

    // Update unread count for other participants
    for (const participantId of conversation.participantIds) {
      if (participantId.toString() !== req.auth.user._id.toString()) {
        await Conversation.findByIdAndUpdate(
          conversationId,
          { $inc: { [`unreadCounts.${participantId}`]: 1 } }
        );
      }
    }

    return res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/messages/conversations/:conversationId/:messageId/read - Mark message as read
router.post('/conversations/:conversationId/:messageId/read', requireAuth, async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participantIds.includes(req.auth.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Message.findByIdAndUpdate(messageId, {
      isRead: true,
      readAt: new Date()
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// POST /api/messages/start - Start a new conversation
router.post('/start', requireAuth, async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    const userId = req.auth.user._id.toString();
    const otherUserId = participantId.toString();

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participantIds: { $all: [userId, otherUserId] }
    }).populate('participantIds', 'displayName email role');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participantIds: [userId, otherUserId],
        unreadCounts: new Map([[otherUserId, 0]])
      });
      await conversation.save();
      await conversation.populate('participantIds', 'displayName email role');
    }

    return res.json({ conversation });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// GET /api/messages/conversations/:conversationId/mark-read - Mark all messages as read
router.post('/conversations/:conversationId/mark-read', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participantIds.includes(req.auth.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Message.updateMany(
      { conversationId, senderId: { $ne: req.auth.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCounts.${req.auth.user._id}`]: 0
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
});

// GET /api/messages/mentors - Get list of mentors (for students)
router.get('/mentors', requireAuth, async (req, res) => {
  try {
    const student = await Student.findOne({ authUserId: req.auth.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const mentors = [student.mentorId];
    const mentorUsers = await User.find({ _id: { $in: mentors } })
      .select('_id displayName email role');

    return res.json({ mentors: mentorUsers });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// GET /api/messages/students - Get list of students (for mentors)
router.get('/students', requireAuth, async (req, res) => {
  try {
    const students = await Student.find({ mentorId: req.auth.user._id })
      .populate('authUserId', '_id displayName email role');

    const studentUsers = students.map(s => s.authUserId);

    return res.json({ students: studentUsers });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

export default router;
