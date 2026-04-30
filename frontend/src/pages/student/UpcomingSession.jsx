import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  FileText, 
  MessageSquare,
  AlertCircle,
  Bell
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';

export const UpcomingSession = () => {
  const session = {
    date: "Thursday, April 30, 2026",
    time: "2:30 PM - 4:00 PM",
    topic: "Advanced TypeScript Patterns",
    mentor: "Nischay",
    type: "Live Workshop",
    location: "Zoom Video Conference",
    description: "Deep dive into TypeScript Generics, Conditional Types, and Mapped Types. We will be building a typesafe API client from scratch.",
    prep: [
      "Review previous session on Basic TypeScript",
      "Install latest version of TypeScript (v5.0+)",
      "Clone the repository: github.com/forgetrack/ts-workshop"
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <section>
        <h2 className="font-display text-3xl font-bold text-fg-primary">Upcoming Session</h2>
        <p className="text-fg-secondary text-sm mt-1">Details for your next scheduled learning session.</p>
      </section>

      <Card glow className="relative">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-3">
              <StatusPill status="info" />
              <span className="text-sm font-mono text-fg-tertiary">{session.date}</span>
            </div>

            <h1 className="text-4xl font-display font-bold text-fg-primary leading-tight">
              {session.topic}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-fg-secondary">
                <Clock size={20} className="text-accent" />
                <span className="text-sm">{session.time}</span>
              </div>
              <div className="flex items-center gap-3 text-fg-secondary">
                <MapPin size={20} className="text-accent" />
                <span className="text-sm">{session.location}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-inset border border-border-subtle">
              <h4 className="text-xs font-bold text-fg-secondary uppercase tracking-widest mb-3">Description</h4>
              <p className="text-sm text-fg-primary leading-relaxed">
                {session.description}
              </p>
            </div>
          </div>

          <div className="md:w-64 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-raised border border-border-subtle flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-fg-tertiary uppercase tracking-widest mb-4">Your Mentor</span>
              <Avatar name={session.mentor} size="lg" className="mb-3" />
              <h4 className="font-bold text-fg-primary">{session.mentor}</h4>
              <p className="text-xs text-fg-secondary">Lead Instructor</p>
              <button className="mt-4 text-accent text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
                <MessageSquare size={14} />
                Ask a Question
              </button>
            </div>
            
            <Button variant="primary" className="w-full h-12 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Video size={20} />
              Join Zoom Meeting
            </Button>
            <Button variant="secondary" className="w-full h-12">
              <Bell size={20} />
              Remind Me
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-xs font-bold text-fg-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-warning" />
            Preparation Required
          </h4>
          <ul className="space-y-4">
            {session.prep.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-fg-secondary leading-normal">
                <div className="w-5 h-5 rounded-full bg-surface-inset border border-border-subtle flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {idx + 1}
                </div>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h4 className="text-xs font-bold text-fg-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText size={16} className="text-accent" />
            Pre-session Resources
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Introduction to TS Slides', type: 'PDF' },
              { label: 'Workshop Code Repo', type: 'Link' },
            ].map((res, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-raised transition-colors cursor-pointer group">
                <span className="text-sm text-fg-primary">{res.label}</span>
                <span className="text-[10px] font-bold text-fg-tertiary bg-surface-inset px-2 py-1 rounded border border-border-subtle group-hover:border-accent group-hover:text-accent transition-colors">
                  {res.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UpcomingSession;
