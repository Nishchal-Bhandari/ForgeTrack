import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import HeatmapGrid from '../../components/ui/HeatmapGrid';
import StatusPill from '../../components/ui/StatusPill';
import Button from '../../components/ui/Button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { getAttendanceStats, getAttendanceHistory, getAttendanceHeatmap } from '../../lib/api';
import toast from 'react-hot-toast';

export const StudentAttendance = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes, heatmapRes] = await Promise.all([
          getAttendanceStats(),
          getAttendanceHistory(1, 50),
          getAttendanceHeatmap(),
        ]);

        setStats(statsRes.stats);
        setHistory(historyRes.history);

        const hData = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          hData.push({
            date: dateStr,
            status: heatmapRes.heatmap[dateStr] || 'none'
          });
        }
        setHeatmap(hData);
      } catch (err) {
        toast.error('Failed to load attendance records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

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
          <div className={clsx(
            "text-[64px] font-display font-bold leading-none mb-2",
            stats?.attendancePercentage >= 75 ? "text-success" : 
            stats?.attendancePercentage >= 60 ? "text-warning" : "text-danger"
          )}>
            {stats?.attendancePercentage || 0}%
          </div>
          <p className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Attendance Score</p>
          <div className="mt-8 flex flex-col gap-2 w-full max-w-[200px]">
            <div className="flex justify-between text-xs">
              <span className="text-fg-secondary">Present</span>
              <span className="text-fg-primary font-mono">{stats?.sessionsAttended || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-fg-secondary">Absent</span>
              <span className="text-fg-primary font-mono">{stats?.sessionsMissed || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-8">
          <HeatmapGrid 
            data={heatmap} 
            month={new Date().toLocaleString('default', { month: 'long' })} 
            year={new Date().getFullYear().toString()}
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
                  <td className="px-8 py-4 text-sm font-mono text-fg-tertiary">
                    {new Date(session.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4 text-sm font-semibold text-fg-primary">{session.topic}</td>
                  <td className="px-8 py-4 text-sm text-fg-secondary">Mentor</td>
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
