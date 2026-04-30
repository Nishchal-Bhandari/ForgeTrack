import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusPill from '../../components/ui/StatusPill';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

export const MentorDashboard = () => {
  const { user } = useAuth();
  
  const stats = [
    { label: 'TOTAL SESSIONS', value: '30', icon: Calendar, delta: '+2', deltaType: 'up' },
    { label: 'OVERALL ATTENDANCE', value: '82.3%', icon: TrendingUp, delta: '+1.2%', deltaType: 'up' },
    { label: 'ACTIVE STUDENTS', value: '36', icon: Users },
    { label: 'LAST SESSION', value: 'May 4, 2026', icon: Clock },
  ];

  const recentActivity = [
    { text: 'Marked attendance for Productionizing ML Models', time: '1d ago', icon: Activity },
    { text: 'Marked attendance for Large Language Models 101', time: '1d ago', icon: Activity },
    { text: 'Marked attendance for ReAct Agent Pattern', time: '1d ago', icon: Activity },
    { text: 'Marked attendance for AI Safety and Ethics', time: '1d ago', icon: Activity },
    { text: 'Marked attendance for Capstone Project Kickoff', time: '1d ago', icon: Activity },
  ];

  const programMetrics = [
    { label: 'Total Sessions', value: '30' },
    { label: 'Average Attendance', value: '82.3%' },
    { label: 'Highest Attendance', value: 'Akash Jain', detail: '100.0%', type: 'success' },
    { label: 'Lowest Attendance', value: 'Shruthi P', detail: '66.7%', type: 'danger' },
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
          <p className="text-fg-secondary text-sm mb-6">No session scheduled for today.</p>
          <div className="mt-auto">
            <Button variant="primary" size="md">
              <Plus size={18} />
              Create Session
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col min-h-[160px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary mb-4">
            TODAY'S ATTENDANCE
          </span>
          <p className="text-fg-secondary text-sm">Create a session first to mark attendance.</p>
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

        {/* Recent Activity */}
        <Card className="flex flex-col h-full">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fg-tertiary mb-6">
            RECENT ACTIVITY
          </span>
          
          <div className="space-y-6 relative">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-accent/40 group-hover:bg-accent/5 transition-all">
                  <activity.icon size={16} className="text-fg-tertiary group-hover:text-accent transition-colors" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm text-fg-primary leading-snug group-hover:text-white transition-colors">
                    {activity.text}
                  </p>
                  <span className="text-[10px] font-mono text-fg-tertiary mt-1 uppercase tracking-wider">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MentorDashboard;
