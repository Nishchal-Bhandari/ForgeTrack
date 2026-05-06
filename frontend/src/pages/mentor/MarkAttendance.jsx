import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  CheckCircle, 
  XCircle, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  History,
  Lock,
  CircleCheck
} from 'lucide-react';
import { 
  format, 
  addDays, 
  subDays, 
  isBefore, 
  isAfter, 
  startOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { getSessionByDate, getSessionAttendance, saveAttendance } from '../../lib/api';
import toast from 'react-hot-toast';

export default function MarkAttendance() {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(startOfDay(new Date())));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [topic, setTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const today = startOfDay(new Date());
  const dateState = isAfter(selectedDate, today) ? 'future' : isBefore(selectedDate, today) ? 'past' : 'today';
  const isLocked = dateState !== 'today';

  const normalizeStudent = (student) => {
    const studentId = student.studentId || student._id || student.id;
    const fullName = student.fullName || student.name || student.displayName || 'Unknown Student';

    return {
      ...student,
      studentId,
      fullName,
      usn: student.usn || student.studentUsn || '',
      department: student.department || student.branchCode || '',
      isPresent: Boolean(student.isPresent),
    };
  };

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const loadSession = async () => {
    try {
      setLoading(true);
      const { session: sessionData } = await getSessionByDate(dateStr);
      setSession(sessionData);
      
      if (sessionData) {
        setTopic(sessionData.topic || '');
        const { students: studentList } = await getSessionAttendance(sessionData._id);
        setStudents(
          studentList.map((student) =>
            normalizeStudent({
              ...student,
              isPresent: student.status === 'present',
            })
          )
        );
      } else {
        setStudents([]);
        setTopic('');
      }
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to load session data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    // Keep currentWeekStart synced if selectedDate jumps out of bounds (e.g. going to today)
    if (isBefore(selectedDate, currentWeekStart) || isAfter(selectedDate, endOfWeek(currentWeekStart))) {
      setCurrentWeekStart(startOfWeek(selectedDate));
    }
  }, [dateStr]);

  const handleSave = async () => {
    if (!session || isLocked) return;
    
    try {
      setSaving(true);
      const payload = {
        topic,
        attendance: students.map(s => ({
          studentId: s.studentId,
          status: s.isPresent ? 'present' : 'absent'
        }))
      };

      await saveAttendance(session._id, payload);
      toast.success('Attendance saved successfully');
      setHasChanges(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const toggleAttendance = (studentId) => {
    if (isLocked) return;
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, isPresent: !s.isPresent } : s
    ));
    setHasChanges(true);
  };

  const markAll = (val) => {
    if (isLocked) return;
    setStudents(prev => prev.map(s => ({ ...s, isPresent: val })));
    setHasChanges(true);
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const fullName = String(student.fullName || '').toLowerCase();
    const usn = String(student.usn || '').toLowerCase();
    return fullName.includes(query) || usn.includes(query);
  });

  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.length - presentCount;
  const attendancePct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Calendar Strip logic
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: endOfWeek(currentWeekStart) });

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-5xl mx-auto">
      <div className="mb-2">
        <div className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest mb-1">Activity</div>
        <h2 className="font-display text-2xl font-bold text-fg-primary mb-1">Mark Attendance</h2>
        <p className="text-sm text-fg-secondary">Select a date — past sessions are read-only, today is editable, future dates are locked.</p>
      </div>

      {/* Visual Calendar Strip */}
      <div className="bg-surface-raised border border-border-subtle rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-fg-primary">
            {format(currentWeekStart, 'MMMM yyyy')}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentWeekStart(prev => subWeeks(prev, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-border-subtle text-fg-secondary hover:text-fg-primary hover:bg-surface-inset transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => {
                setSelectedDate(today);
                setCurrentWeekStart(startOfWeek(today));
              }}
              className="px-3 h-8 flex items-center justify-center rounded-xl border border-border-subtle text-xs font-bold text-fg-secondary hover:text-fg-primary hover:bg-surface-inset transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-border-subtle text-fg-secondary hover:text-fg-primary hover:bg-surface-inset transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isSameDay(day, today);
            const isDayFuture = isAfter(day, today);
            const isDayPast = isBefore(day, today);
            
            return (
              <div 
                key={day.toISOString()}
                onClick={() => !isDayFuture && setSelectedDate(day)}
                className={`
                  flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all
                  ${isDayFuture ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-inset'}
                  ${isSelected ? 'bg-surface-inset shadow-inner' : ''}
                `}
              >
                <span className="text-[10px] font-bold text-fg-tertiary uppercase">
                  {format(day, 'EEE')}
                </span>
                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors
                  ${isSelected ? 'bg-fg-primary text-bg-primary' : isDayToday ? 'bg-accent/20 text-accent' : 'text-fg-primary'}
                `}>
                  {format(day, 'd')}
                </div>
                <div className="w-1.5 h-1.5 rounded-full mt-1 flex items-center justify-center">
                   {isDayFuture ? (
                     <Lock size={8} className="text-fg-tertiary" />
                   ) : isDayPast ? (
                     // Since we don't fetch all month data, we can just show a neutral dot or history icon
                     <History size={8} className="text-fg-tertiary" />
                   ) : (
                     <div className="w-1.5 h-1.5 rounded-full bg-success" />
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* State Banner */}
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
        ${dateState === 'past' ? 'bg-surface-inset text-fg-secondary border-border-subtle' : ''}
        ${dateState === 'today' ? 'bg-success/10 text-success border-success/20' : ''}
        ${dateState === 'future' ? 'bg-danger/10 text-danger border-danger/20' : ''}
      `}>
        {dateState === 'past' && <><History size={18} /> Viewing past session — <strong>read-only</strong>. Changes are locked.</>}
        {dateState === 'today' && <><CircleCheck size={18} /> Today's session — mark attendance freely.</>}
        {dateState === 'future' && <><Lock size={18} /> Future date — attendance cannot be marked yet.</>}
      </div>

      {session ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-fg-tertiary">Session date</label>
            <div className="bg-surface-raised border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-medium text-fg-secondary flex items-center justify-between">
              {format(selectedDate, 'dd MMM yyyy')}
              <CalendarIcon size={16} className="text-fg-tertiary" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-fg-tertiary">Session topic</label>
            <input
              className={`
                bg-surface-raised border border-border-default rounded-xl px-4 py-2.5 text-sm font-medium focus:border-accent outline-none transition-all
                ${isLocked ? 'text-fg-secondary bg-surface-inset cursor-not-allowed' : 'text-fg-primary'}
              `}
              value={topic}
              onChange={(e) => {
                if (isLocked) return;
                setTopic(e.target.value);
                setHasChanges(true);
              }}
              placeholder="e.g., Introduction to Circuits"
              readOnly={isLocked}
            />
          </div>
        </div>
      ) : !loading && dateState !== 'future' ? (
        <Card className="border-border-subtle text-center py-12">
          <AlertCircle size={40} className="mx-auto text-fg-tertiary mb-4 opacity-40" />
          <h4 className="text-lg font-bold text-fg-primary mb-2">No session was found for this date.</h4>
          <p className="text-sm text-fg-tertiary max-w-sm mx-auto mb-6">
            Sessions are typically created during CSV import or scheduled by administration. 
          </p>
          {dateState !== 'today' && (
            <Button variant="secondary" onClick={() => {
              setSelectedDate(today);
              setCurrentWeekStart(startOfWeek(today));
            }}>
              Go to Today
            </Button>
          )}
        </Card>
      ) : null}

      {(session || dateState === 'future') && (
        <Card className="!p-0 border-border-subtle overflow-hidden">
          <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row items-center gap-4 bg-surface/30">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" />
              <input
                className="w-full bg-surface-inset border border-border-default rounded-lg pl-10 pr-3 py-2 text-sm text-fg-primary focus:border-accent outline-none transition-all"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => markAll(true)} 
                disabled={isLocked}
                className="px-3 py-2 rounded-lg border border-border-subtle text-xs font-bold text-fg-secondary hover:bg-surface-inset disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                All Present
              </button>
              <button 
                onClick={() => markAll(false)} 
                disabled={isLocked}
                className="px-3 py-2 rounded-lg border border-border-subtle text-xs font-bold text-fg-secondary hover:bg-surface-inset disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                All Absent
              </button>
            </div>
            {session && (
              <div className="flex items-center gap-3 text-xs font-bold text-fg-secondary ml-auto whitespace-nowrap">
                {presentCount}/{students.length}
                <div className="w-16 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-success transition-all duration-300" style={{ width: `${attendancePct}%` }} />
                </div>
              </div>
            )}
          </div>

          {dateState === 'future' ? (
            <div className="py-24 flex flex-col items-center justify-center text-fg-tertiary gap-3">
              <Lock size={32} />
              <span className="text-sm font-medium">Future date — not yet unlocked</span>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-border-subtle">
              {filteredStudents.map((student) => (
                <div key={student.studentId} className="flex items-center p-4 hover:bg-surface-raised/30 transition-colors">
                  <div className="mr-3">
                     <Avatar name={student.fullName} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-fg-primary truncate">{student.fullName}</div>
                    <div className="text-xs font-mono text-fg-tertiary truncate">{student.usn}</div>
                  </div>
                  <button
                    onClick={() => toggleAttendance(student.studentId)}
                    disabled={isLocked}
                    className={`
                      px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all
                      ${student.isPresent 
                        ? 'bg-[#EAF3DE] text-[#3B6D11] dark:bg-success/20 dark:text-success' 
                        : 'bg-[#FCEBEB] text-[#A32D2D] dark:bg-danger/20 dark:text-danger'}
                      ${isLocked ? 'opacity-60 cursor-default' : 'hover:scale-105 cursor-pointer shadow-sm'}
                    `}
                  >
                    {student.isPresent ? 'PRESENT' : 'ABSENT'}
                  </button>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-sm text-fg-tertiary">
                  No students found matching your search.
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Bottom Footer Area */}
      {session && (
        <div className="flex items-center justify-between p-4 bg-surface-raised border border-border-subtle rounded-2xl shadow-sm mt-4">
          {dateState === 'today' ? (
            <>
              <div className="text-xs font-medium text-fg-tertiary">
                <span className="font-bold text-fg-primary">{presentCount}</span> of {students.length} marked present
              </div>
              <Button variant="primary" size="sm" onClick={handleSave} loading={saving} disabled={!hasChanges}>
                <Save size={16} className="mr-2" />
                Save Attendance
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-medium text-warning">
                <AlertCircle size={16} />
                Read-only — contact admin to modify past records
              </div>
              <Button variant="secondary" size="sm" disabled>
                <Lock size={16} className="mr-2" />
                Locked
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
