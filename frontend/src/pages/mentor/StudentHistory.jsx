import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Clock,
  Calendar,
  AlertCircle,
  Download
} from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import HeatmapGrid from '../../components/ui/HeatmapGrid';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

export const StudentHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const mockStudents = [
    { name: 'Arjun Sharma', usn: '1RV21CS007', branch: 'CSE', batch: '2021-25', attendance: 88 },
    { name: 'Priya K.', usn: '1RV21CS012', branch: 'ISE', batch: '2021-25', attendance: 72 },
    { name: 'Rahul V.', usn: '1RV21CS021', branch: 'ECE', batch: '2021-25', attendance: 45 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const found = mockStudents.find(s => s.usn.toLowerCase().includes(searchQuery.toLowerCase()));
    setSelectedStudent(found || null);
  };

  const heatmapData = Array.from({ length: 31 }, (_, i) => ({
    date: `2026-04-${i + 1}`,
    status: Math.random() > 0.8 ? 'absent' : Math.random() > 0.2 ? 'present' : 'none'
  }));

  const history = [
    { date: '2026-04-28', topic: 'React Performance Optimization', status: 'present', duration: '90 min', notes: 'Active participation' },
    { date: '2026-04-26', topic: 'Redux Toolkit Fundamentals', status: 'present', duration: '120 min', notes: '-' },
    { date: '2026-04-24', topic: 'Introduction to TypeScript', status: 'absent', duration: '90 min', notes: 'Medical leave' },
    { date: '2026-04-22', topic: 'CSS Architecture with Tailwind', status: 'present', duration: '60 min', notes: '-' },
    { date: '2026-04-20', topic: 'JavaScript ES6+ Features', status: 'present', duration: '90 min', notes: '-' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="font-display text-3xl font-bold text-fg-primary">Student History</h2>
        <p className="text-fg-secondary text-sm mt-1">Search and view detailed learning journey of students.</p>
      </section>

      {/* Search Section */}
      <Card className="!p-0">
        <form onSubmit={handleSearch} className="flex items-center p-4">
          <Search size={20} className="text-fg-tertiary ml-2" />
          <input
            type="text"
            placeholder="Search student by Name or USN..."
            className="flex-1 bg-transparent border-none px-4 py-2 text-fg-primary placeholder:text-fg-tertiary focus:ring-0 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </Card>

      {selectedStudent ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-5 flex flex-col items-center text-center">
              <Avatar name={selectedStudent.name} size="lg" className="mb-6 ring-4 ring-surface-inset ring-offset-4 ring-offset-accent/20" />
              <h3 className="font-display text-[32px] font-bold text-fg-primary leading-tight">
                {selectedStudent.name}
              </h3>
              <p className="text-sm font-mono text-fg-tertiary uppercase tracking-[0.15em] mt-1">
                {selectedStudent.usn}
              </p>
              
              <div className="flex gap-2 mt-4">
                <div className="bg-surface-raised px-3 py-1 rounded-full text-[10px] font-bold text-fg-secondary border border-border-subtle uppercase">
                  {selectedStudent.branch}
                </div>
                <div className="bg-surface-raised px-3 py-1 rounded-full text-[10px] font-bold text-fg-secondary border border-border-subtle uppercase">
                  {selectedStudent.batch}
                </div>
              </div>

              <div className="w-full h-px bg-border-subtle my-8" />

              <div className="space-y-1">
                <div className={clsx(
                  "text-[56px] font-display font-bold tabular-nums",
                  selectedStudent.attendance >= 75 ? "text-success" : 
                  selectedStudent.attendance >= 60 ? "text-warning" : "text-danger"
                )}>
                  {selectedStudent.attendance}%
                </div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-tertiary">
                  Overall Attendance
                </p>
              </div>
              
              <p className="text-xs text-fg-secondary mt-4 bg-surface-inset px-4 py-2 rounded-lg border border-border-subtle">
                Attended <span className="text-fg-primary font-bold">14</span> of <span className="text-fg-primary font-bold">18</span> sessions
              </p>
            </Card>

            {/* Heatmap Card */}
            <Card className="lg:col-span-7">
              <HeatmapGrid 
                data={heatmapData} 
                month="April" 
                year="2026" 
                onMonthChange={(dir) => console.log('Month change:', dir)} 
              />
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-inset border border-border-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-success rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-fg-tertiary">Present Days</span>
                  </div>
                  <div className="text-2xl font-bold text-fg-primary tabular-nums">14</div>
                </div>
                <div className="p-4 rounded-xl bg-surface-inset border border-border-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-danger rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-fg-tertiary">Absent Days</span>
                  </div>
                  <div className="text-2xl font-bold text-fg-primary tabular-nums">4</div>
                </div>
              </div>
            </Card>
          </div>

          {/* History Table */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border-subtle flex justify-between items-center bg-surface/50">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-tertiary">
                Detailed Attendance Log
              </h3>
              <Button variant="ghost" size="sm">
                <Download size={16} />
                Export CSV
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-inset">
                    <th className="px-6 py-4 text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Topic</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Duration</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {history.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-raised transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-fg-secondary group-hover:text-fg-primary">{row.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-fg-primary">{row.topic}</td>
                      <td className="px-6 py-4">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-fg-secondary">{row.duration}</td>
                      <td className="px-6 py-4 text-xs text-fg-tertiary italic">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState 
          icon={Search}
          heading="Start Searching"
          subtext="Enter a student USN or Name to view their complete attendance history and heatmap overview."
        />
      )}
    </div>
  );
};

export default StudentHistory;
