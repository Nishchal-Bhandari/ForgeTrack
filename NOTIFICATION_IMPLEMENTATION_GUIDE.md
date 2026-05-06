# NOTIFICATION SYSTEM - IMPLEMENTATION GUIDE

## Current State Analysis

### What Exists ✅
- Notification model in MongoDB
- `/api/student/notifications` endpoint (GET)
- `/api/student/notifications/:id/read` endpoint (POST)
- Notifications ARE created when materials are uploaded
- API functions in frontend (getNotifications, markNotificationRead, etc.)

### What's Missing ❌
- **Notification UI component** (no notification center)
- **Notification bell icon** in top navigation
- **Notification triggers** for attendance marking
- **Real-time notification system** (updates are manual)
- **Students never call notification endpoints**
- **No badge/count showing** unread notifications

---

## Implementation Plan

### STEP 1: Create Notification Triggers in Backend (30-45 min)

#### File: `backend/src/routes/mentor.js`

**Location 1: When attendance is marked**
Add this after `Attendance.bulkWrite()` around line 450:

```javascript
// Send notifications to students when attendance is marked
const changedStudentIds = attendance.map(item => item.studentId);
const changedStudents = await Student.find({ _id: { $in: changedStudentIds } })
  .populate('authUserId');

const notifications = changedStudents.map(student => ({
  userId: student.authUserId._id,
  title: 'Attendance Marked',
  message: `Attendance has been marked for session: ${topic || 'General'}`,
  type: 'info',
  link: '/attendance'
}));

if (notifications.length > 0) {
  await Notification.insertMany(notifications);
}
```

**Location 2: When session is created**
Add this in `/api/mentor/sessions/:date` route after session is saved (around line 420):

```javascript
// Notify all students about new session
if (!session || session.isNew) {
  const students = await User.find({ role: 'student' });
  const notifications = students.map(student => ({
    userId: student._id,
    title: 'New Session Scheduled',
    message: `A new session has been scheduled for ${new Date(session.date).toLocaleDateString()}`,
    type: 'info',
    link: '/upcoming-session'
  }));
  
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
}
```

---

### STEP 2: Create Notification Center Component (1-2 hours)

#### Create file: `frontend/src/components/NotificationCenter.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Mail, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api';
import toast from 'react-hot-toast';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { notifications: data } = await getNotifications();
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'danger': return '✕';
      default: return 'ℹ';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface-raised rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell size={20} className="text-fg-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface-raised border border-border-default rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <h3 className="font-bold text-fg-primary">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-accent hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-fg-tertiary hover:text-fg-primary"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-fg-secondary">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-fg-tertiary">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-border-subtle hover:bg-surface-inset transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-accent/5' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      notification.type === 'success' ? 'bg-success/20 text-success' :
                      notification.type === 'warning' ? 'bg-warning/20 text-warning' :
                      notification.type === 'danger' ? 'bg-danger/20 text-danger' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-fg-primary text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-fg-secondary mt-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-fg-tertiary mt-2 block">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border-subtle text-center">
              <button className="text-xs text-fg-tertiary hover:text-fg-secondary">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
```

---

### STEP 3: Integrate Notification Center into TopBar (15 min)

#### File: `frontend/src/components/layout/Topbar.jsx`

Find the topbar component and add NotificationCenter:

```jsx
import { NotificationCenter } from '../NotificationCenter';

export function Topbar() {
  // ... existing code ...

  return (
    <div className="flex items-center gap-4">
      {/* ... existing elements ... */}
      
      {/* Add this before user menu */}
      {user?.role === 'student' && (
        <NotificationCenter />
      )}

      {/* ... rest of topbar ... */}
    </div>
  );
}
```

---

### STEP 4: Implement Heatmap Endpoint (30 min)

#### File: `backend/src/routes/student.js`

Add this new endpoint (after the other student routes):

```javascript
// GET /api/student/heatmap - Get attendance heatmap data (30 days)
router.get('/heatmap', requireAuth, ensureStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ authUserId: req.auth.user._id });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const heatmap = {};
    const today = new Date();
    
    // Get last 30 days of attendance
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      
      const dateStr = d.toISOString().split('T')[0];
      
      const attendance = await Attendance.findOne({
        studentId: student._id,
        createdAt: {
          $gte: d,
          $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      heatmap[dateStr] = attendance 
        ? (attendance.status === 'present' ? 'present' : 'absent')
        : 'none';
    }

    return res.json({ heatmap });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return res.status(500).json({ error: 'Failed to fetch heatmap' });
  }
});
```

---

### STEP 5: Fix Hardcoded Data (1-2 hours)

#### File: `frontend/src/pages/student/UpcomingSession.jsx`

Replace hardcoded data with backend fetch:

```jsx
// Before:
const displayData = {
  mentor: "Nischay", // ← HARDCODED
  time: "2:30 PM - 4:00 PM", // ← HARDCODED
  location: "Zoom Video Conference", // ← HARDCODED
};

// After:
const [mentorInfo, setMentorInfo] = useState(null);

useEffect(() => {
  const fetchMentorInfo = async () => {
    if (!session) return;
    try {
      // Fetch mentor info from session
      const mentor = await getMentorForSession(session._id);
      setMentorInfo(mentor);
    } catch (err) {
      console.error(err);
    }
  };
  fetchMentorInfo();
}, [session]);

const displayData = {
  mentor: mentorInfo?.displayName || "Mentor",
  time: session?.startTime && session?.endTime 
    ? `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`
    : "Time TBD",
  location: session?.meetingLink || session?.location || "TBD",
};
```

---

### STEP 6: Display Mentor Names in Student Views (45 min)

#### File: `frontend/src/pages/student/StudentAttendance.jsx`

Update attendance history to show mentor:

```jsx
// Before:
<td className="px-8 py-4 text-sm text-fg-secondary">Mentor</td>

// After:
<td className="px-8 py-4 text-sm text-fg-secondary">
  {session.markedBy?.displayName || 'Unknown'}
</td>
```

And update the API to fetch mentor info:

```javascript
// In backend/src/routes/student.js
// Update attendance-history route to populate mentor:

const records = await Attendance.find(query)
  .populate('sessionId', 'date topic duration_hours')
  .populate('markedBy', 'displayName') // ← ADD THIS
  .sort({ markedAt: -1 })
  .skip(skip)
  .limit(parseInt(limit));
```

---

## Testing Checklist

### Test Case 1: Notification on Attendance Mark
```
1. Login as mentor
2. Mark student attendance
3. Login as that student in another browser/window
4. Verify notification appears in bell icon
5. Verify notification count increases
6. Click notification to mark as read
7. Verify notification is read (no dot)
```

### Test Case 2: Notification on Material Upload
```
1. Login as mentor
2. Upload a material
3. Login as student
4. Verify notification appears
5. Verify message mentions material title
```

### Test Case 3: Heatmap Display
```
1. Login as student
2. Go to Attendance page
3. Verify heatmap loads without errors
4. Verify colors match attendance status
5. Verify 30 days of data displayed
```

### Test Case 4: Mentor Names Display
```
1. Mark attendance as mentor (note your name)
2. Login as student
3. Go to Attendance History
4. Verify your mentor name appears (not "Mentor")
5. Go to Upcoming Session
6. Verify mentor name is not hardcoded
```

---

## Database Changes Required

### Add to Attendance model:
```javascript
markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

### Add to Session model:
```javascript
startTime: { type: String }, // Format: "HH:mm"
endTime: { type: String },
mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
meetingLink: { type: String },
location: { type: String },
isActive: { type: Boolean, default: true }
```

---

## Estimated Timeline

| Task | Time | Priority |
|------|------|----------|
| Add notification triggers | 30-45 min | 🔴 CRITICAL |
| Create NotificationCenter component | 1-2 hours | 🔴 CRITICAL |
| Integrate into TopBar | 15 min | 🔴 CRITICAL |
| Heatmap endpoint | 30 min | 🟠 HIGH |
| Fix hardcoded data | 1-2 hours | 🟠 HIGH |
| Show mentor names | 45 min | 🟠 HIGH |
| **TOTAL** | **4-6 hours** | |

---

## Testing Environment Setup

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Test student account
# Create test account via CSV upload or manual add

# Open two browsers:
# Browser 1: http://localhost:5173/login (Mentor)
# Browser 2: http://localhost:5173/login (Student - incognito)

# Mark attendance in Mentor and watch Student get notification
```

---

## Success Criteria

✅ Students receive notifications when attendance is marked  
✅ Students receive notifications when materials are uploaded  
✅ Notification bell shows unread count  
✅ Notifications can be marked as read  
✅ Heatmap displays attendance data correctly  
✅ Mentor names displayed throughout app  
✅ Session times can be set by mentor  
✅ No hardcoded values in student views  

---

**This implementation will transform the app from read-only to interactive!**
