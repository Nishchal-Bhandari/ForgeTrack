import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  CheckCircle, 
  XCircle, 
  Save, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusPill from '../../components/ui/StatusPill';
import Avatar from '../../components/ui/Avatar';
import { getSessionByDate, getSessionAttendance, saveAttendance } from '../../lib/api';
import toast from 'react-hot-toast';

export default function MarkAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [topic, setTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

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

  const date = format(selectedDate, 'yyyy-MM-dd');

  const loadSession = async () => {
    try {
      setLoading(true);
      const { session: sessionData } = await getSessionByDate(date);
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
  }, [date]);

  const handleSave = async () => {
    if (!session) return;
    
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
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, isPresent: !s.isPresent } : s
    ));
    setHasChanges(true);
  };

  const markAll = (val) => {
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

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <section>
          <div className="flex items-center gap-3 text-accent mb-2">
            <CheckCircle size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Session Record</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-fg-primary tracking-tight">Mark Attendance</h2>
        </section>

        <div className="flex items-center bg-surface-raised p-1.5 rounded-2xl border border-border-subtle shadow-inner w-full lg:w-auto">
          <button 
            onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            className="p-3 hover:bg-surface-inset text-fg-tertiary hover:text-fg-primary rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex-1 lg:w-48 text-center px-4">
            <span className="text-sm font-bold text-fg-primary block">
              {format(selectedDate, 'EEEE')}
            </span>
            <span className="text-[11px] font-mono text-fg-tertiary uppercase tracking-wider">
              {format(selectedDate, 'dd MMMM yyyy')}
            </span>
          </div>

          <button 
            onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            className="p-3 hover:bg-surface-inset text-fg-tertiary hover:text-fg-primary rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <Card className="border-border-subtle overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-fg-primary">
                {session ? 'Active Session Found' : 'No Session Scheduled'}
              </h3>
              <p className="text-xs text-fg-tertiary">
                {date === format(new Date(), 'yyyy-MM-dd') ? "Today's Session Record" : `Record for ${date}`}
              </p>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            onClick={loadSession} 
            loading={loading}
            className="w-full md:w-auto px-8"
          >
            {loading ? 'Refreshing...' : 'Refresh Session'}
          </Button>
        </div>

        {session ? (
          <div className="pt-8 border-t border-border-subtle animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-fg-tertiary mb-2 block">
                  Session Subject / Topic
                </label>
                <input
                  className="w-full bg-surface-inset border border-border-default rounded-xl px-4 py-3 text-lg font-bold text-fg-primary focus:border-accent outline-none transition-all"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="e.g., Introduction to Neural Networks"
                />
              </div>
              <div className="flex gap-4">
                <div className="bg-surface-raised px-4 py-3 rounded-xl border border-border-subtle text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-fg-tertiary uppercase block mb-1">Type</span>
                  <span className="text-sm font-bold text-accent uppercase">{session.sessionType}</span>
                </div>
                <div className="bg-surface-raised px-4 py-3 rounded-xl border border-border-subtle text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-fg-tertiary uppercase block mb-1">Duration</span>
                  <span className="text-sm font-bold text-fg-primary">{session.durationHours * 60} MIN</span>
                </div>
              </div>
            </div>
          </div>
        ) : !loading && (
          <div className="pt-8 border-t border-border-subtle animate-fade-in">
            <div className="bg-surface-inset rounded-2xl p-12 text-center border border-dashed border-border-subtle">
              <AlertCircle size={40} className="mx-auto text-fg-tertiary mb-4 opacity-40" />
              <h4 className="text-lg font-bold text-fg-primary mb-2">No session was found for this date.</h4>
              <p className="text-sm text-fg-tertiary max-w-sm mx-auto mb-8">
                Sessions are typically created during CSV import or scheduled by administration. 
                Please select another date or contact support.
              </p>
              <Button variant="secondary" onClick={() => setSelectedDate(new Date())}>
                Go to Today
              </Button>
            </div>
          </div>
        )}
      </Card>

      {session && (
        <Card className="!p-0 border-border-subtle overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-fg-primary font-mono">{students.length}</span>
                <span className="text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Enrolled Students</span>
              </div>
              <div className="h-10 w-px bg-border-subtle hidden md:block" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-xs font-bold text-fg-secondary">{presentCount} Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs font-bold text-fg-secondary">{absentCount} Absent</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="secondary" size="sm" onClick={() => markAll(true)} className="flex-1 md:flex-none">
                Mark All Present
              </Button>
              <Button variant="secondary" size="sm" onClick={() => markAll(false)} className="flex-1 md:flex-none">
                Mark All Absent
              </Button>
            </div>
          </div>

          <div className="p-6 border-b border-border-subtle bg-surface/10">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-tertiary" />
              <input
                className="w-full bg-surface-inset border border-border-default rounded-xl pl-12 pr-4 py-3 text-sm text-fg-primary focus:border-accent outline-none transition-all"
                placeholder="Filter by USN or Student Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-raised/50 border-b border-border-subtle">
                  <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Student Information</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">USN</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-surface-raised/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar name={student.fullName} size="sm" />
                        <span className="text-sm font-semibold text-fg-primary group-hover:text-accent transition-colors">
                          {student.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-mono text-fg-tertiary bg-surface-raised px-2 py-1 rounded border border-border-subtle uppercase tracking-wider">
                        {student.usn}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleAttendance(student.studentId)}
                          className={`
                            relative flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 min-w-[120px] justify-center
                            ${student.isPresent 
                              ? 'bg-success/10 border-success/30 text-success shadow-lg shadow-success/5' 
                              : 'bg-danger/10 border-danger/30 text-danger shadow-lg shadow-danger/5'}
                          `}
                        >
                          {student.isPresent ? (
                            <>
                              <CheckCircle size={16} />
                              <span className="text-[11px] font-bold uppercase tracking-wider">Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              <span className="text-[11px] font-bold uppercase tracking-wider">Absent</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-surface-raised/80 backdrop-blur-xl border border-accent/30 rounded-2xl p-3 shadow-2xl flex items-center gap-6 pr-6">
            <div className="flex items-center gap-3 pl-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-bold text-fg-primary">Unsaved Changes</span>
            </div>
            <div className="h-6 w-px bg-border-subtle" />
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={loadSession}>
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                <Save size={18} />
                Save Attendance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
