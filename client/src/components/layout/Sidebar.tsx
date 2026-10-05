import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { STARTUP_NAV_ITEMS, LAWYER_NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../config/constants';
import { Icon } from '../ui/Icon';
import './Sidebar.css';

interface SidebarProps {
  role: 'startup' | 'lawyer' | 'admin';
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, onClose }) => {
  const navItems = role === 'admin' ? ADMIN_NAV_ITEMS : role === 'startup' ? STARTUP_NAV_ITEMS : LAWYER_NAV_ITEMS;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">Counselly</Link>
        {onClose && (
          <button className="sidebar-close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon name={item.icon} size={20} className="sidebar-link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={() => {/* logout logic later */}}>
          <Icon name="log-out" size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
