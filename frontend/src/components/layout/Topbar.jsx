import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

export const Topbar = ({ onMenuClick }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('attendance')) return 'Attendance';
    if (path.includes('students')) return 'Student History';
    if (path.includes('upload')) return 'CSV Upload';
    if (path.includes('materials')) return 'Materials Library';
    if (path.includes('upcoming')) return 'Upcoming Session';
    return 'ForgeTrack';
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-10 backdrop-blur-md sticky top-0 z-30 page-header" style={{
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      backgroundColor: 'rgba(17, 17, 24, 0.5)',
    }}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md transition-all"
          style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        
        <h1 className="text-lg font-semibold md:text-xl" style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--text-primary)',
        }}>
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md transition-all relative" style={{
          color: 'var(--text-secondary)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <Bell size={20} strokeWidth={1.75} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2" style={{
            backgroundColor: 'var(--accent-primary)',
            borderColor: 'var(--secondary-surface)',
          }} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
