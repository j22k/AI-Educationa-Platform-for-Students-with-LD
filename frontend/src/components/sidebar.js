import React, { useState } from 'react';
import {
  Home,
  Users,
  Settings,
  Info,
  Menu,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import '../css/sidebar.css';

const Sidebar = () => {
  const userName = localStorage.getItem('name');  
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { title: 'Dashboard', icon: Home },
    { title: 'Users', icon: Users },
    { title: 'Settings', icon: Settings },
    { title: 'About', icon: Info },
  ];

  return (
    <div className="sidebar-container">
      <button 
        className="mobile-trigger"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>

      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <nav className={`sidebar ${isOpen ? 'expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>

        <div className="sidebar-header">
          {isOpen ? (
            <div className="logo-full">
              {userName}
            </div>
          ) : (
            <div className="logo-small">
              
            </div>
          )}
        </div>

        <div className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.title} href="#" className="nav-item">
                <Icon />
                {isOpen && <span>{item.title}</span>}
              </a>
            );
          })}
        </div>

        <div className="sidebar-footer">
          {isOpen && <span>© 2024 Company</span>}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;