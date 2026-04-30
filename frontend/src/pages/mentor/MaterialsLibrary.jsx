import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Video, 
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';

export const MaterialsLibrary = ({ role = 'student' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockMaterials = [
    {
      id: '1',
      date: 'APR 28, 2026',
      topic: 'React Performance Optimization',
      items: [
        { type: 'pdf', label: 'Optimization Techniques Slides', url: '#' },
        { type: 'video', label: 'Session Recording', url: '#' },
        { type: 'link', label: 'React DevTools Guide', url: '#' },
      ]
    },
    {
      id: '2',
      date: 'APR 26, 2026',
      topic: 'Redux Toolkit & State Management',
      items: [
        { type: 'pdf', label: 'RTK Fundamentals Slides', url: '#' },
        { type: 'link', label: 'Project Boilerplate Code', url: '#' },
      ]
    },
    {
      id: '3',
      date: 'APR 24, 2026',
      topic: 'Advanced TypeScript Patterns',
      items: [
        { type: 'pdf', label: 'Generics & Utility Types Slides', url: '#' },
        { type: 'video', label: 'Live Coding Session', url: '#' },
        { type: 'pdf', label: 'Cheat Sheet: TS Patterns', url: '#' },
      ]
    },
    {
      id: '4',
      date: 'APR 22, 2026',
      topic: 'CSS Architecture with Tailwind',
      items: [
        { type: 'pdf', label: 'Styling Systems Slides', url: '#' },
        { type: 'link', label: 'Tailwind Config Best Practices', url: '#' },
      ]
    }
  ];

  const filteredMaterials = mockMaterials.filter(m => 
    m.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'link': return LinkIcon;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-fg-primary">Materials Library</h2>
          <p className="text-fg-secondary text-sm mt-1">Access slides, recordings, and reference notes from all sessions.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" />
            <input 
              type="text"
              placeholder="Search topics..."
              className="w-full bg-surface-inset border border-border-default rounded-md pl-10 pr-4 py-2.5 text-sm text-fg-primary focus:border-accent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-surface-raised border border-border-default rounded-md px-4 py-2.5 text-sm font-medium text-fg-secondary hover:text-fg-primary transition-all">
              <Filter size={16} />
              Month
              <ChevronDown size={14} />
            </button>
            
            {role === 'mentor' && (
              <Button variant="primary" className="flex-1 sm:flex-none">
                <Plus size={18} />
                Add Material
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} hover className="flex flex-col h-full group">
              <div className="mb-4">
                <span className="text-[10px] font-mono text-fg-tertiary uppercase tracking-[0.15em] font-bold">
                  {material.date}
                </span>
                <h3 className="text-lg font-bold text-fg-primary mt-1 leading-tight group-hover:text-accent transition-colors">
                  {material.topic}
                </h3>
              </div>

              <div className="w-full h-px bg-border-subtle my-4" />

              <div className="space-y-1 flex-1">
                {material.items.map((item, idx) => {
                  const Icon = getIcon(item.type);
                  return (
                    <a 
                      key={idx}
                      href={item.url}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-surface-raised group/item transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-surface-inset rounded-md text-accent border border-border-subtle group-hover/item:bg-accent/10 transition-colors">
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <span className="text-sm font-medium text-fg-secondary group-hover/item:text-fg-primary transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-fg-tertiary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </a>
                  );
                })}
              </div>
              
              {role === 'mentor' && (
                <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end gap-2">
                  <button className="text-[10px] font-bold text-fg-tertiary hover:text-fg-primary uppercase tracking-widest p-1">Edit</button>
                  <button className="text-[10px] font-bold text-danger/70 hover:text-danger uppercase tracking-widest p-1">Delete</button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={BookOpen}
          heading="No Materials Found"
          subtext={searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "There are no materials uploaded yet. Check back later."}
          action={role === 'mentor' && (
            <Button variant="primary">
              <Plus size={18} />
              Upload First Material
            </Button>
          )}
        />
      )}
    </div>
  );
};

export default MaterialsLibrary;
