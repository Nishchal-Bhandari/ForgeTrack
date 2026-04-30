import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import HeatmapGrid from '../../components/ui/HeatmapGrid';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusPill from '../../components/ui/StatusPill';
import { getStudentRecord, getAttendanceStats, getAttendanceHistory, getAttendanceHeatmap } from '../../lib/api';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, statsRes, historyRes, heatmapRes] = await Promise.all([
          getStudentRecord(),
          getAttendanceStats(),
          getAttendanceHistory(1, 4),
          getAttendanceHeatmap(),
        ]);

        setStudentData(studentRes.student);
        setStats(statsRes.stats);
        setHistory(historyRes.history);

        // Convert heatmap to grid format
        const heatmapData = [];
        Object.entries(heatmapRes.heatmap || {}).forEach(([date, status]) => {
          heatmapData.push({ date, status });
        });
        // Fill in remaining days as 'none'
        for (let i = 1; i <= 30; i++) {
          const dateStr = `2026-04-${String(i).padStart(2, '0')}`;
          if (!heatmapData.find(d => d.date === dateStr)) {
            heatmapData.push({ date: dateStr, status: 'none' });
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  const displayData = {
    name: studentData?.fullName || user?.name || "Student",
    usn: studentData?.usn || "N/A",
    branch: studentData?.department || "N/A",
    batch: `${studentData?.batchYear}–${(studentData?.batchYear || 0) + 3}`,
    attendancePct: stats?.attendancePercentage || 0,
    totalSessions: stats?.totalSessions || 0,
    attendedSessions: stats?.sessionsAttended || 0
  };

  const nextSession = {
    date: "APR 30",
    time: "2:30 PM",
    topic: "Advanced TypeScript Patterns",
    type: "Live Session",
    notes: "Please review the previous slides on Generics before joining."
  };

  const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-04-${i + 1}`,
    status: i < 15 ? (Math.random() > 0.8 ? 'absent' : 'present') : 'none'
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Card */}
      <Card glow className="!p-0 border-accent/20">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="flex-1 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-border-subtle">
            <h2 className="font-display text-[42px] md:text-[52px] font-bold text-fg-primary leading-tight tracking-tight">
              Hey, <span className="text-accent">{displayData.name.split(' ')[0]}</span>!
            </h2>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-fg-tertiary uppercase tracking-widest">USN:</span>
                <span className="text-sm font-mono text-fg-secondary font-bold">{displayData.usn}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-fg-tertiary uppercase tracking-widest">Department:</span>
                <span className="text-sm font-mono text-fg-secondary font-bold">{displayData.branch}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-fg-tertiary uppercase tracking-widest">Batch:</span>
                <span className="text-sm font-mono text-fg-secondary font-bold">{displayData.batch}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-bold text-fg-tertiary uppercase tracking-widest">Target Attendance</span>
                  <span className="text-xs font-mono text-fg-secondary">{displayData.attendancePct} / 75%</span>
                </div>
                <ProgressBar progress={displayData.attendancePct} height="h-2" />
              </div>
              <div className={clsx(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border",
                displayData.attendancePct >= 75 
                  ? "text-success bg-success/10 border-success/20" 
                  : "text-warning bg-warning/10 border-warning/20"
              )}>
                <TrendingUp size={14} />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {displayData.attendancePct >= 75 ? 'On Track' : 'At Risk'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col items-center justify-center lg:w-72 bg-accent/5">
            <div className={clsx(
              "text-[72px] font-display font-bold leading-none tabular-nums",
              displayData.attendancePct >= 75 ? "text-success" : 
              displayData.attendancePct >= 60 ? "text-warning" : "text-danger"
            )}>
              {displayData.attendancePct}
            </div>
            <span className="text-[11px] font-bold text-fg-tertiary uppercase tracking-[0.2em] mt-2">
              Percentage
            </span>
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card className="flex flex-col h-full">
          <HeatmapGrid 
            data={heatmapData} 
            month="April" 
            year="2026" 
            onMonthChange={() => {}}
          />
          <div className="mt-auto pt-6 flex justify-between items-center text-xs text-fg-tertiary font-mono uppercase tracking-widest">
            <span>Present: {stats?.sessionsAttended || 0} sessions</span>
            <span>Absent: {stats?.sessionsMissed || 0} sessions</span>
          </div>
        </Card>

        {/* Next Session */}
        <Card className="flex flex-col bg-surface-raised/30 border-accent/10">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-tertiary mb-6 block">
            Upcoming Session
          </span>
          
          <div className="flex justify-between items-start mb-4">
            <div className="text-[48px] md:text-[56px] font-display font-bold text-fg-primary leading-none tabular-nums">
              {nextSession.date}
            </div>
            <StatusPill status="info" />
          </div>

          <h3 className="text-2xl font-bold text-fg-primary mb-2">
            {nextSession.topic}
          </h3>
          
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 text-fg-secondary">
              <Clock size={16} />
              <span className="text-sm font-mono">{nextSession.time}</span>
            </div>
            <div className="flex items-center gap-2 text-fg-secondary">
              <MapPin size={16} />
              <span className="text-sm">Online (Zoom)</span>
            </div>
          </div>

          <div className="mt-auto p-4 rounded-xl bg-surface-inset border border-border-subtle flex gap-4">
            <AlertCircle size={20} className="text-accent shrink-0" />
            <p className="text-xs text-fg-secondary italic leading-relaxed">
              {nextSession.notes}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary">
            Recent Sessions
          </h3>
          <button className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest flex items-center gap-1">
            View Full History
            <ArrowRight size={12} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-inset">
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Topic</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {history.map((session, idx) => (
                <tr key={idx} className="hover:bg-surface-raised transition-colors group">
                  <td className="px-8 py-4 text-sm font-mono text-fg-tertiary group-hover:text-fg-primary">
                    {new Date(session.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4 text-sm font-semibold text-fg-primary">{session.topic}</td>
                  <td className="px-8 py-4">
                    <StatusPill status={session.status} />
                  </td>
                  <td className="px-8 py-4 text-sm text-fg-secondary">{session.duration}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
