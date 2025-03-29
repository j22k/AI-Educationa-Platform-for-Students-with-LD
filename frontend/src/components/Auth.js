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
      console.log('formData:', formData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log(data);
      console.log('User ID:', data.userId);
      

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

  const styles = {
    // Main container with split layout
    pageContainer: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '"Poppins", "Segoe UI", Roboto, Arial, sans-serif',
    },
    
    // Left panel with illustration/branding
    brandPanel: {
      flex: '1',
      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    },
    
    brandContent: {
      zIndex: '2',
      maxWidth: '500px',
      textAlign: 'center'
    },
    
    brandBackground: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      opacity: '0.1',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
    },
    
    logo: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      letterSpacing: '0.05em'
    },

    logoHighlight: {
      color: '#A5B4FC'
    },
    
    brandHeading: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem'
    },
    
    brandDescription: {
      fontSize: '1.15rem',
      lineHeight: '1.7',
      marginBottom: '2rem',
      opacity: '0.9'
    },
    
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      textAlign: 'left',
      margin: '2rem 0'
    },
    
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1.1rem'
    },
    
    featureIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    // Right panel with form
    formPanel: {
      flex: '1',
      background: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'auto'
    },
    
    formContainer: {
      maxWidth: '450px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem'
    },
    
    formHeading: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.75rem'
    },
    
    formSubheading: {
      color: '#6B7280',
      marginBottom: '2rem',
      fontSize: '1.1rem'
    },
    
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    
    authToggle: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      background: '#E5E7EB',
      borderRadius: '9999px',
      padding: '0.25rem',
      position: 'relative'
    },
    
    authToggleButton: {
      flex: '1',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '9999px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      zIndex: '1',
      transition: 'color 0.3s ease',
      background: 'transparent',
      color: '#6B7280'
    },
    
    authToggleActive: {
      color: '#111827'
    },
    
    authToggleSlider: {
      position: 'absolute',
      top: '0.25rem',
      left: '0.25rem',
      width: 'calc(50% - 0.25rem)',
      height: 'calc(100% - 0.5rem)',
      background: 'white',
      borderRadius: '9999px',
      transition: 'transform 0.3s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    
    sliderActive: {
      transform: 'translateX(calc(100% + 0.25rem))'
    },
    
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    
    label: {
      fontSize: '0.95rem',
      fontWeight: '500',
      color: '#374151'
    },
    
    input: {
      padding: '0.9rem 1rem',
      background: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    
    submitButton: {
      padding: '1rem',
      background: '#4F46E5',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      marginTop: '1rem'
    },
    
    forgotPassword: {
      textAlign: 'right',
      fontSize: '0.95rem',
      marginTop: '0.5rem'
    },
    
    link: {
      color: '#4F46E5',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'opacity 0.2s ease'
    },
    
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '2rem 0',
      color: '#6B7280',
      fontSize: '0.95rem'
    },
    
    dividerLine: {
      flex: '1',
      height: '1px',
      background: '#E5E7EB'
    },
    
    dividerText: {
      padding: '0 1rem'
    },
    
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    
    socialButton: {
      padding: '0.75rem',
      background: 'white',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    
    accessibilityFeatures: {
      marginTop: '2rem',
      padding: '1rem',
      background: '#EFF6FF',
      borderRadius: '0.5rem',
      border: '1px solid #DBEAFE',
      fontSize: '0.95rem',
      color: '#1E40AF',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    
    accessibilityIcon: {
      minWidth: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    // Responsive adjustments
    '@media (max-width: 1024px)': {
      pageContainer: {
        flexDirection: 'column'
      },
      brandPanel: {
        display: 'none'
      }
    }
  };

  // Apply hover and focus styles dynamically
  const getInputStyle = (focused) => ({
    ...styles.input,
    borderColor: focused ? '#4F46E5' : '#D1D5DB',
    boxShadow: focused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none'
  });

  const getButtonStyle = (hovered) => ({
    ...styles.submitButton,
    background: hovered ? '#4338CA' : '#4F46E5'
  });

  const getSocialButtonStyle = (hovered) => ({
    ...styles.socialButton,
    borderColor: hovered ? '#4F46E5' : '#D1D5DB',
    color: hovered ? '#4F46E5' : '#374151'
  });

  return (
    <div style={styles.pageContainer}>
      {/* Brand Panel (Left Side) */}
      <div style={styles.brandPanel}>
        <div style={styles.brandBackground}></div>
        <div style={styles.brandContent}>
          <div style={styles.logo}>
            Learn<span style={styles.logoHighlight}>Ability</span>
          </div>
          <h1 style={styles.brandHeading}>Learning made accessible for everyone</h1>
          <p style={styles.brandDescription}>
            An AI-powered assistant specially designed for students with learning disabilities including dyslexia, 
            dysgraphia, dyscalculia, and autism spectrum disorder.
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span>Personalized learning paths</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span>Early detection of learning difficulties</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span>Interactive 3D avatar assistance</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span>Emotional intelligence technology</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Panel (Right Side) */}
      <div style={styles.formPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formHeading}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p style={styles.formSubheading}>
            {isLogin 
              ? 'Sign in to continue your learning journey' 
              : 'Join us and discover personalized learning experiences'}
          </p>
          
          {/* Auth Toggle */}
          <div style={styles.authToggle}>
            <button 
              style={{
                ...styles.authToggleButton,
                ...(isLogin ? styles.authToggleActive : {})
              }}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              style={{
                ...styles.authToggleButton,
                ...(!isLogin ? styles.authToggleActive : {})
              }}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
            <div 
              style={{
                ...styles.authToggleSlider,
                ...(!isLogin ? styles.sliderActive : {})
              }}
            ></div>
          </div>
          
          {/* Authentication Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={getInputStyle(false)}
                  placeholder="John Doe"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={getInputStyle(false)}
                placeholder="you@example.com"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F46E5';
                  e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={getInputStyle(false)}
                placeholder="••••••••"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F46E5';
                  e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {!isLogin && (
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={getInputStyle(false)}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4F46E5';
                    e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {isLogin && (
              <div style={styles.forgotPassword}>
                <a href="#" style={styles.link}>Forgot password?</a>
              </div>
            )}

            <button 
              type="submit" 
              style={getButtonStyle(false)}
              onMouseOver={(e) => e.target.style.background = '#4338CA'}
              onMouseOut={(e) => e.target.style.background = '#4F46E5'}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <div style={styles.dividerText}>or continue with</div>
            <div style={styles.dividerLine}></div>
          </div>
          
          {/* Social Login Buttons */}
          <div style={styles.socialButtons}>
            <button 
              style={getSocialButtonStyle(false)}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#4F46E5';
                e.target.style.color = '#4F46E5';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.color = '#374151';
              }}
            >
              Google
            </button>
            <button 
              style={getSocialButtonStyle(false)}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#4F46E5';
                e.target.style.color = '#4F46E5';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.color = '#374151';
              }}
            >
              Microsoft
            </button>
          </div>
          
          {/* Accessibility Feature Notice */}
          <div style={styles.accessibilityFeatures}>
            <div style={styles.accessibilityIcon}>ℹ️</div>
            <div>
              We offer enhanced accessibility features and adaptive learning tools for students with diverse learning needs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;