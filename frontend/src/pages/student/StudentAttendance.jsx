import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import HeatmapGrid from '../../components/ui/HeatmapGrid';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';
import { Download, FileText } from 'lucide-react';

export const StudentAttendance = () => {
  const { user } = useAuth();

  const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-04-${i + 1}`,
    status: i < 15 ? (Math.random() > 0.8 ? 'absent' : 'present') : 'none'
  }));

  const history = [
    { date: '2026-04-28', topic: 'React Performance Optimization', status: 'present', duration: '90 min', mentor: 'Nischay' },
    { date: '2026-04-26', topic: 'Redux Toolkit Fundamentals', status: 'present', duration: '120 min', mentor: 'Nischay' },
    { date: '2026-04-24', topic: 'Introduction to TypeScript', status: 'absent', duration: '90 min', mentor: 'Nischay' },
    { date: '2026-04-22', topic: 'CSS Architecture with Tailwind', status: 'present', duration: '60 min', mentor: 'Nischay' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-3xl font-bold text-fg-primary">My Attendance</h2>
          <p className="text-fg-secondary text-sm mt-1">Review your session attendance records and patterns.</p>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={16} />
          Export History
        </Button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 flex flex-col items-center justify-center text-center py-10">
          <div className="text-[64px] font-display font-bold text-success leading-none mb-2">88%</div>
          <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Attendance Score</p>
          <div className="mt-8 flex flex-col gap-2 w-full max-w-[200px]">
            <div className="flex justify-between text-xs">
              <span className="text-fg-secondary">Present</span>
              <span className="text-fg-primary font-mono">16</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-fg-secondary">Absent</span>
              <span className="text-fg-primary font-mono">2</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-fg-secondary">Excused</span>
              <span className="text-fg-primary font-mono">0</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-8">
          <HeatmapGrid 
            data={heatmapData} 
            month="April" 
            year="2026"
            onMonthChange={() => {}}
          />
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-inset">
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Topic</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Mentor</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {history.map((session, idx) => (
                <tr key={idx} className="hover:bg-surface-raised transition-colors">
                  <td className="px-8 py-4 text-sm font-mono text-fg-tertiary">{session.date}</td>
                  <td className="px-8 py-4 text-sm font-semibold text-fg-primary">{session.topic}</td>
                  <td className="px-8 py-4 text-sm text-fg-secondary">{session.mentor}</td>
                  <td className="px-8 py-4">
                    <StatusPill status={session.status} />
                  </td>
                  <td className="px-8 py-4 text-sm text-fg-secondary">{session.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentAttendance;
