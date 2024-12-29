import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/signup';

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log(data);


      if (data.status) {
        alert(isLogin ? 'Login successful' : 'Signup successful');
        // Store user ID and name in local storage
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('name', data.name);

        if (!isLogin) setIsLogin(true);
        navigate('/dash');
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const formStyle = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    },
    formCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      color: '#1a73e8',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#5f6368',
      marginBottom: '1.5rem'
    },
    tabs: {
      display: 'flex',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #ddd'
    },
    tab: {
      flex: 1,
      padding: '0.75rem',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      color: '#5f6368',
      borderBottom: '2px solid transparent'
    },
    activeTab: {
      color: '#1a73e8',
      borderBottom: '2px solid #1a73e8'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.9rem',
      color: '#5f6368'
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem'
    },
    button: {
      padding: '0.75rem',
      background: '#1a73e8',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    forgotPassword: {
      textAlign: 'right',
      fontSize: '0.9rem'
    },
    link: {
      color: '#1a73e8',
      textDecoration: 'none'
    },
    divider: {
      margin: '1.5rem 0',
      textAlign: 'center',
      borderTop: '1px solid #ddd',
      position: 'relative'
    },
    dividerText: {
      backgroundColor: 'white',
      padding: '0 10px',
      color: '#5f6368',
      position: 'relative',
      top: '-10px'
    },
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    socialButton: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '0.9rem',
      color: '#5f6368'
    }
  };

  return (
    <div style={formStyle.container}>
      <div style={formStyle.formCard}>
        <div style={formStyle.header}>
          <h1 style={formStyle.title}>EduLearn Platform</h1>
          <p style={formStyle.subtitle}>Your gateway to knowledge</p>
        </div>

        <div style={formStyle.tabs}>
          <button
            style={{ ...formStyle.tab, ...(isLogin ? formStyle.activeTab : {}) }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            style={{ ...formStyle.tab, ...(!isLogin ? formStyle.activeTab : {}) }}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle.form}>
          {!isLogin && (
            <div style={formStyle.formGroup}>
              <label style={formStyle.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={formStyle.input}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div style={formStyle.formGroup}>
            <label style={formStyle.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={formStyle.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={formStyle.formGroup}>
            <label style={formStyle.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={formStyle.input}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div style={formStyle.formGroup}>
              <label style={formStyle.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={formStyle.input}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {isLogin && (
            <div style={formStyle.forgotPassword}>
              <a href="#" style={formStyle.link}>Forgot password?</a>
            </div>
          )}

          <button type="submit" style={formStyle.button}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={formStyle.divider}>
          <span style={formStyle.dividerText}>Or continue with</span>
        </div>

        <div style={formStyle.socialButtons}>
          <button style={formStyle.socialButton}>Google</button>
          <button style={formStyle.socialButton}>Microsoft</button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;