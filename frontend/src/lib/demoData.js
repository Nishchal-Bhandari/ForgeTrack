export const mentorDemo = {
  name: 'Nischay',
  email: 'mentor@example.com',
  lastLogin: 'Apr 29, 2026',
};

export const studentDemo = {
  name: 'Arjun Sharma',
  usn: '1RV21CS007',
  branch: 'CSE',
  batch: '2021–25',
  attendancePct: 88,
};

export const mentorStudents = Array.from({ length: 25 }, (_, index) => {
  const number = String(index + 1).padStart(3, '0');
  const branch = index % 3 === 0 ? 'CSE' : index % 3 === 1 ? 'ISE' : 'ECE';

  return {
    id: index + 1,
    name: `Student ${index + 1}`,
    usn: `1RV21CS${number}`,
    branch,
    present: index < 22,
  };
});

export const mentorStats = {
  totalSessions: 18,
  avgAttendance: 84.6,
  activeStudents: 25,
  nextSession: 'Today 04:00 PM',
};

export const todaysSession = {
  topic: 'Advanced TypeScript',
  type: 'Live',
  duration: '90 min',
  date: 'Apr 30, 2026',
};

export const todayAttendance = {
  present: 22,
  absent: 3,
};

export const mentorActivity = [
  { id: 1, tone: 'success', action: 'Attendance saved for React Hooks', time: '10 min ago' },
  { id: 2, tone: 'info', action: 'Shared System Design notes', time: '32 min ago' },
  { id: 3, tone: 'warning', action: '2 students flagged for review', time: '1 hr ago' },
  { id: 4, tone: 'success', action: 'Uploaded DSA tree worksheet', time: '2 hrs ago' },
  { id: 5, tone: 'info', action: 'New session created for Friday', time: 'Today' },
];

export const mentorProgramRows = [
  { label: 'Total Sessions', value: '18' },
  { label: 'Avg Attendance', value: '84.6%' },
  { label: 'Top Attendee', value: 'Arjun Sharma' },
  { label: 'Needs Attention', value: '3 learners' },
];

export const attendanceHistory = [
  { date: 'Apr 29, 2026', topic: 'React Hooks', status: 'present', duration: '90 min', notes: 'Submitted recap questions.' },
  { date: 'Apr 27, 2026', topic: 'System Design', status: 'present', duration: '90 min', notes: 'Asked strong follow-up questions.' },
  { date: 'Apr 25, 2026', topic: 'DSA - Trees', status: 'absent', duration: '90 min', notes: 'Missed due to lab schedule.' },
  { date: 'Apr 22, 2026', topic: 'TypeScript Basics', status: 'present', duration: '75 min', notes: 'Completed practice exercise.' },
  { date: 'Apr 20, 2026', topic: 'API Design', status: 'warning', duration: '60 min', notes: 'Late join, needs follow-up.' },
];

export const monthHeatmap = Array.from({ length: 35 }, (_, index) => {
  const day = index + 1;
  if (day > 30) {
    return { date: `2026-04-${String(day).padStart(2, '0')}`, status: 'future' };
  }

  if (day % 7 === 0 || day % 11 === 0) {
    return { date: `2026-04-${String(day).padStart(2, '0')}`, status: 'absent' };
  }

  if (day % 5 === 0) {
    return { date: `2026-04-${String(day).padStart(2, '0')}`, status: 'none' };
  }

  return { date: `2026-04-${String(day).padStart(2, '0')}`, status: 'present' };
});

export const materialGroups = [
  {
    id: 1,
    date: 'Apr 30, 2026',
    topic: 'Advanced TypeScript',
    items: [
      { id: 1, label: 'Slides PDF', type: 'file', url: '#' },
      { id: 2, label: 'Recording Link', type: 'link', url: '#' },
      { id: 3, label: 'Notes Doc', type: 'video', url: '#' },
    ],
  },
  {
    id: 2,
    date: 'Apr 27, 2026',
    topic: 'System Design',
    items: [
      { id: 1, label: 'Architecture deck', type: 'file', url: '#' },
      { id: 2, label: 'Reference article', type: 'link', url: '#' },
      { id: 3, label: 'Whiteboard capture', type: 'video', url: '#' },
    ],
  },
  {
    id: 3,
    date: 'Apr 25, 2026',
    topic: 'DSA - Trees',
    items: [
      { id: 1, label: 'Problem set PDF', type: 'file', url: '#' },
      { id: 2, label: 'Recorded walkthrough', type: 'video', url: '#' },
      { id: 3, label: 'Further reading', type: 'link', url: '#' },
    ],
  },
];

export const studentSessions = [
  { id: 1, date: 'Apr 30, 2026', topic: 'Advanced TypeScript', status: 'present', duration: '90 min' },
  { id: 2, date: 'Apr 27, 2026', topic: 'System Design', status: 'present', duration: '90 min' },
  { id: 3, date: 'Apr 25, 2026', topic: 'DSA - Trees', status: 'absent', duration: '90 min' },
  { id: 4, date: 'Apr 22, 2026', topic: 'React Hooks', status: 'present', duration: '75 min' },
  { id: 5, date: 'Apr 20, 2026', topic: 'API Design', status: 'warning', duration: '60 min' },
  { id: 6, date: 'Apr 18, 2026', topic: 'Testing Basics', status: 'present', duration: '60 min' },
  { id: 7, date: 'Apr 15, 2026', topic: 'Performance Tuning', status: 'present', duration: '90 min' },
  { id: 8, date: 'Apr 13, 2026', topic: 'Routing Patterns', status: 'present', duration: '75 min' },
  { id: 9, date: 'Apr 10, 2026', topic: 'State Management', status: 'present', duration: '90 min' },
  { id: 10, date: 'Apr 08, 2026', topic: 'CSS Architecture', status: 'absent', duration: '60 min' },
];

export const nextSession = {
  date: 'Apr 30, 2026',
  topic: 'Advanced TypeScript',
  time: '04:00 PM',
  type: 'Live',
  mentorNotes: 'Focus on generic constraints and narrowing patterns.',
};

export const attendanceHeatmapData = monthHeatmap;

export const csvSteps = ['Upload', 'Map Columns', 'Validate', 'Import'];
