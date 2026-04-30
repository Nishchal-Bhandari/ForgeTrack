import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Search, 
  Check, 
  Save, 
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatusPill from '../../components/ui/StatusPill';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';

export const MarkAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      id: `id-${i}`,
      name: i === 6 ? 'Arjun Sharma' : `Student ${i + 1}`,
      usn: `1RV21CS${String(i + 1).padStart(3, '0')}`,
      branch: i % 3 === 0 ? 'CSE' : i % 3 === 1 ? 'ISE' : 'ECE',
      isPresent: false
    }))
  );

  const [hasChanges, setHasChanges] = useState(false);

  const toggleStudent = (id) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, isPresent: !s.isPresent } : s
    ));
    setHasChanges(true);
  };

  const markAll = (val) => {
    setStudents(prev => prev.map(s => ({ ...s, isPresent: val })));
    setHasChanges(true);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.usn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <section>
        <h2 className="font-display text-3xl font-bold text-fg-primary">Mark Attendance</h2>
        <p className="text-fg-secondary text-sm mt-1">Select a date and mark student attendance for the session.</p>
      </section>

      {/* Controls Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full max-w-sm">
            <Input
              label="Session Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button 
            variant="primary" 
            className="w-full md:w-auto px-8"
            onClick={() => setIsLoaded(true)}
          >
            Load Session
          </Button>
        </div>

        {isLoaded && (
          <div className="mt-8 pt-8 border-t border-border-subtle animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-tertiary">
                  Current Session
                </span>
                <h3 className="text-xl font-bold text-fg-primary mt-1">Advanced TypeScript Patterns</h3>
              </div>
              <div className="flex gap-3">
                <StatusPill status="info" />
                <div className="bg-surface-raised px-3 py-1 rounded-full text-[11px] font-bold text-fg-secondary border border-border-subtle">
                  90 MIN
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {isLoaded && (
        <>
          {/* Student List List Card */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/50">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <h3 className="text-lg font-semibold text-fg-primary">
                  Students <span className="text-fg-tertiary font-mono ml-1">({students.length})</span>
                </h3>
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" />
                  <input 
                    type="text"
                    placeholder="Search USN or Name..."
                    className="w-full bg-surface-inset border border-border-default rounded-md pl-10 pr-4 py-2 text-sm text-fg-primary focus:border-accent outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="secondary" size="sm" onClick={() => markAll(true)} className="flex-1 md:flex-none">
                  All Present
                </Button>
                <Button variant="secondary" size="sm" onClick={() => markAll(false)} className="flex-1 md:flex-none">
                  All Absent
                </Button>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-border-subtle">
                {filteredStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className={clsx(
                      "flex items-center gap-4 px-6 md:px-8 py-4 transition-all duration-200 group cursor-pointer",
                      student.isPresent ? "bg-accent/5" : "hover:bg-surface-raised"
                    )}
                    onClick={() => toggleStudent(student.id)}
                  >
                    {/* Custom Checkbox */}
                    <div className={clsx(
                      "w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center shrink-0",
                      student.isPresent 
                        ? "bg-accent border-accent text-white" 
                        : "border-border-default bg-surface-inset group-hover:border-border-strong"
                    )}>
                      {student.isPresent && <Check size={16} strokeWidth={3} />}
                    </div>

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar name={student.name} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className={clsx(
                          "text-sm font-semibold transition-colors truncate",
                          student.isPresent ? "text-fg-primary" : "text-fg-secondary group-hover:text-fg-primary"
                        )}>
                          {student.name}
                        </span>
                        <span className="text-[10px] font-mono text-fg-tertiary uppercase tracking-wider">
                          {student.usn}
                        </span>
                      </div>
                    </div>

                    <div className="bg-surface-raised px-2 py-1 rounded text-[10px] font-bold text-fg-tertiary border border-border-subtle">
                      {student.branch}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 md:left-60 right-0 z-40 bg-canvas/80 backdrop-blur-xl border-t border-border-subtle p-4 md:px-10 md:py-6 animate-slide-up">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm font-medium text-fg-primary tabular-nums">{presentCount} <span className="text-fg-secondary">Present</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger rounded-full" />
                  <span className="text-sm font-medium text-fg-primary tabular-nums">{absentCount} <span className="text-fg-secondary">Absent</span></span>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="px-10 shadow-[0_-4px_20px_rgba(99,102,241,0.2)]"
                disabled={!hasChanges}
                onClick={() => alert('Attendance Saved!')}
              >
                <Save size={20} strokeWidth={1.75} />
                Save Attendance
              </Button>
            </div>
          </div>
        </>
      )}

      {!isLoaded && (
        <EmptyState 
          icon={Calendar}
          heading="No Session Loaded"
          subtext="Select a date and click 'Load Session' to start marking attendance for your students."
        />
      )}
    </div>
  );
};

export default MarkAttendance;
