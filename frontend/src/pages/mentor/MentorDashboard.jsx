import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Plus,
  Activity,
  UserCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusPill from '../../components/ui/StatusPill';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { getMentorStats } from '../../lib/api';
import toast from 'react-hot-toast';

export const MentorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getMentorStats();
        setData(result.stats);
      } catch (err) {
        toast.error('Failed to fetch dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  const stats = [
    { label: 'TOTAL SESSIONS', value: data.totalSessions, icon: Calendar },
    { label: 'AVG ATTENDANCE', value: `${data.avgAttendance}%`, icon: TrendingUp },
    { label: 'ACTIVE STUDENTS', value: data.totalStudents, icon: Users },
    { label: 'TODAY PERCENTAGE', value: data.today.total > 0 ? `${Math.round((data.today.present / data.today.total) * 100)}%` : 'N/A', icon: UserCheck },
  ];

  const programMetrics = [
    { label: 'Total Sessions', value: data.totalSessions },
    { label: 'Average Attendance', value: `${data.avgAttendance}%` },
    { label: 'Present Today', value: data.today.present, type: 'success' },
    { label: 'Absent Today', value: data.today.absent, type: 'danger' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col gap-1">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-fg-primary tracking-tight">
          Welcome back, <span className="text-white">{user?.name || 'Nischay'}</span>
        </h2>
        <p className="text-fg-tertiary text-sm font-medium">
          Thursday, Apr 30
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard 
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            delta={stat.delta}
            deltaType={stat.deltaType}
          />
        ))}
      </section>

      {/* Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glow className="flex flex-col min-h-[160px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary mb-4">
            TODAY'S SESSION
          </span>
          {data.today.total > 0 || data.today.sessionTopic !== 'No session today' ? (
            <>
              <h3 className="text-xl font-bold text-white mb-2">{data.today.sessionTopic}</h3>
              <p className="text-fg-secondary text-sm mb-6">Attendance is currently being tracked.</p>
              <div className="mt-auto">
                <Link to="/mentor/mark-attendance">
                  <Button variant="primary" size="md">
                    <ClipboardCheck size={18} />
                    Mark Attendance
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-fg-secondary text-sm mb-6">No session scheduled for today.</p>
              <div className="mt-auto">
                <Link to="/mentor/mark-attendance">
                  <Button variant="primary" size="md">
                    <Plus size={18} />
                    Create Session
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>

        <Card className="flex flex-col min-h-[160px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary mb-4">
            TODAY'S ATTENDANCE
          </span>
          {data.today.total > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-3xl font-bold text-white">{data.today.present}</span>
                  <span className="text-fg-tertiary text-sm ml-2">/ {data.today.total} present</span>
                </div>
                <StatusPill status={data.today.present / data.today.total > 0.8 ? 'success' : 'warning'} label={`${Math.round((data.today.present / data.today.total) * 100)}%`} />
              </div>
              <ProgressBar progress={(data.today.present / data.today.total) * 100} size="md" />
            </div>
          ) : (
            <p className="text-fg-secondary text-sm">Create a session first to mark attendance.</p>
          )}
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Program Overview */}
        <Card className="flex flex-col h-full">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary mb-6">
            PROGRAM OVERVIEW
          </span>
          
          <div className="space-y-6">
            {programMetrics.map((item, idx) => (
              <div key={item.label}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg-secondary">{item.label}</span>
                  <div className="text-right">
                    <span className={clsx(
                      "text-sm font-bold block",
                      item.type === 'success' ? 'text-success' : 
                      item.type === 'danger' ? 'text-danger' : 'text-fg-primary'
                    )}>
                      {item.value}
                    </span>
                    {item.detail && (
                      <span className={clsx(
                        "text-[10px] font-bold",
                        item.type === 'success' ? 'text-success/70' : 'text-danger/70'
                      )}>
                        {item.detail}
                      </span>
                    )}
                  </div>
                </div>
                {idx < programMetrics.length - 1 && (
                  <div className="h-px bg-border-subtle mt-4" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Absent Students */}
        <Card className="flex flex-col h-full">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary mb-6">
            ABSENT STUDENTS (TODAY)
          </span>
          
          <div className="space-y-6 relative">
            {data.today.absentStudents && data.today.absentStudents.length > 0 ? (
              data.today.absentStudents.map((student, idx) => (
                <div key={idx} className="flex gap-4 group items-center">
                  <Avatar name={student.fullName} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-fg-primary leading-snug group-hover:text-white transition-colors">
                      {student.fullName}
                    </p>
                    <span className="text-[10px] font-mono text-fg-tertiary mt-1 uppercase tracking-wider">
                      {student.usn}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <StatusPill status="danger" label="Absent" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <UserCheck size={32} className="text-fg-tertiary mb-2 opacity-20" />
                <p className="text-sm text-fg-tertiary italic">No absent students recorded for today.</p>
              </div>
            )}
          </div>
          {data.today.absentStudents?.length > 0 && (
            <div className="mt-auto pt-6">
              <Link to="/mentor/student-history" className="text-accent text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                View Full History <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MentorDashboard;
