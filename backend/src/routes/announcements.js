import express from 'express';
import { Announcement } from '../models/Announcement.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Notification } from '../models/Notification.js';
import { requireAuth, requireMentor } from '../middleware/auth.js';

const router = express.Router();

console.log('Announcements router loaded');

// GET /api/announcements - Get all active announcements
router.get('/', requireAuth, async (req, res) => {
  console.log('GET /announcements called');
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'displayName email role')
      .sort({ isPinned: -1, createdAt: -1 });

    // Add isRead flag for current user
    const announcementsWithReadStatus = announcements.map(ann => ({
      ...ann.toObject(),
      isRead: ann.readBy.some(r => r.userId.toString() === req.auth.user._id.toString())
    }));

    return res.json({ announcements: announcementsWithReadStatus });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// GET /api/announcements/:id - Get single announcement
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'displayName email role');

    if (!announcement || !announcement.isActive) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    return res.json({ announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// POST /api/announcements - Create new announcement (mentor only)
router.post('/', requireAuth, requireMentor, async (req, res) => {
  try {
    const { title, content, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      createdBy: req.auth.user._id,
      isPinned: isPinned || false,
      readBy: [{ userId: req.auth.user._id }] // Mark as read for creator
    });

    await announcement.save();
    await announcement.populate('createdBy', 'displayName email role');

    // Notify all students
    try {
      const students = await Student.find({ isActive: true })
        .populate('authUserId', '_id');

      const notifications = students.map(student => ({
        userId: student.authUserId._id,
        title: 'New Announcement',
        message: title,
        type: 'info',
        link: '/announcements'
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error('Error sending announcement notifications:', notifErr);
    }

    return res.status(201).json({ announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// PUT /api/announcements/:id - Update announcement (creator only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPinned } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.auth.user._id.toString()) {
      return res.status(403).json({ error: 'Can only edit your own announcements' });
    }

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (isPinned !== undefined) announcement.isPinned = isPinned;

    await announcement.save();
    await announcement.populate('createdBy', 'displayName email role');

    return res.json({ announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// DELETE /api/announcements/:id - Delete announcement (creator only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.auth.user._id.toString()) {
      return res.status(403).json({ error: 'Can only delete your own announcements' });
    }

    announcement.isActive = false;
    await announcement.save();

    return res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// POST /api/announcements/:id/read - Mark announcement as read
router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Check if already read
    const alreadyRead = announcement.readBy.some(
      r => r.userId.toString() === req.auth.user._id.toString()
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        userId: req.auth.user._id,
        readAt: new Date()
      });
      await announcement.save();
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// POST /api/announcements/:id/pin - Pin/unpin announcement (mentor only)
router.post('/:id/pin', requireAuth, requireMentor, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.auth.user._id.toString()) {
      return res.status(403).json({ error: 'Can only pin your own announcements' });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    return res.json({ announcement, isPinned: announcement.isPinned });
  } catch (error) {
    console.error('Error pinning announcement:', error);
    return res.status(500).json({ error: 'Failed to pin announcement' });
  }
});

export default router;
