// App.js
import React, { useState } from 'react';
import './Dashboard.css';

// Mock user data
const userData = {
  name: "John Doe",
  role: "Student",
  email: "john.doe@example.com",
  grade: "12th Grade",
  avatar: "/api/placeholder/100/100"
};

// Mock sidebar menu items
const menuItems = [
  { id: 1, title: "Dashboard", icon: "📊" },
  { id: 2, title: "Courses", icon: "📚" },
  { id: 3, title: "Assignments", icon: "📝" },
  { id: 4, title: "Grades", icon: "🎯" },
  { id: 5, title: "Calendar", icon: "📅" },
  { id: 6, title: "Messages", icon: "✉️" },
  { id: 7, title: "Settings", icon: "⚙️" }
];

const Dashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuClick = (title) => {
    setActiveMenuItem(title);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const MainContent = () => {
    switch (activeMenuItem) {
      case 'Dashboard':
        return (
          <div className="main-dashboard">
            <h2>Welcome back, {userData.name}!</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Current Courses</h3>
                <p>6 Active Courses</p>
              </div>
              <div className="stat-card">
                <h3>Assignments Due</h3>
                <p>3 Pending</p>
              </div>
              <div className="stat-card">
                <h3>Average Grade</h3>
                <p>92%</p>
              </div>
            </div>
          </div>
        );
      case 'Profile':
        return (
          <div className="profile-section">
            <h2>User Profile</h2>
            <div className="profile-card">
              <img src={userData.avatar} alt="Profile" className="profile-avatar" />
              <div className="profile-info">
                <h3>{userData.name}</h3>
                <p>Role: {userData.role}</p>
                <p>Email: {userData.email}</p>
                <p>Grade: {userData.grade}</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="content-section">
            <h2>{activeMenuItem}</h2>
            <p>Content for {activeMenuItem} goes here...</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h2>EduDash</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <div className="profile-brief">
          <img src={userData.avatar} alt="Profile" className="profile-pic" />
          <div className="profile-text">
            <h3>{userData.name}</h3>
            <p>{userData.role}</p>
          </div>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${activeMenuItem === item.title ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.title)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-title">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
      <main className="main-content">
        <header className="content-header">
          <h1>{activeMenuItem}</h1>
        </header>
        <MainContent />
      </main>
    </div>
  );
};

export default Dashboard;