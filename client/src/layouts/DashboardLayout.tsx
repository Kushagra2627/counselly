import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Icon } from '../components/ui/Icon';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../features/auth/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: 'startup' | 'lawyer' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role: propRole }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeRole: 'startup' | 'lawyer' | 'admin' = propRole || (user?.role === 'ADMIN' ? 'admin' : user?.role === 'LAWYER' ? 'lawyer' : 'startup');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-off-white)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-charcoal)',
        color: 'var(--color-white)',
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--transition-base)',
      }} className="sidebar-container">
        <Sidebar role={activeRole} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar placeholder */}
      <div className="sidebar-placeholder" style={{ width: 'var(--sidebar-width)', flexShrink: 0, display: 'none' }} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-height)',
          backgroundColor: 'var(--color-white)',
          borderBottom: '1px solid var(--color-gray-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'none', padding: 'var(--space-2)' }}
          >
            <Icon name="menu" size={24} />
          </button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>{user?.name || 'User Profile'}</span>
            <Avatar name={user?.name || 'User'} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: 'var(--space-8)', flex: 1, overflowX: 'hidden' }}>
          <div style={{ maxWidth: 'var(--max-content)', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-container { transform: translateX(0) !important; }
          .sidebar-placeholder { display: block !important; }
        }
        @media (max-width: 1023px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
};
