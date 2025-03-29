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
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 p-2 rounded-full bg-blue-600 text-white shadow-lg z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      />
      
      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-50 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'w-64' : 'w-20'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Toggle Button */}
        <button
          className="absolute -right-3 top-10 bg-blue-600 text-white p-1 rounded-full hidden lg:block"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl mb-2">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-800 dark:text-white truncate max-w-full">
                  {userName || 'User'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <a 
                    href="#" 
                    className={`flex items-center p-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 group transition-all
                      ${isOpen ? '' : 'justify-center'}`}
                  >
                    <Icon size={22} className="text-blue-600" />
                    {isOpen && (
                      <span className="ml-3 transition-opacity">{item.title}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {isOpen && "© 2024 Learning Assistant"}
        </div>
      </div>
    </>
  );
};

export default Sidebar;