import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            color: 'white', 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🚀 Job Tracker
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/login" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-primary"
              style={{ fontSize: '14px' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav style={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          color: 'white', 
          textDecoration: 'none',
          background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚀 Job Tracker
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link 
              to="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/add-job" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ➕ Add Job
            </Link>
            <Link 
              to="/timeline" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📈 Timeline
            </Link>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ color: 'white', fontSize: '14px' }}>
              👋 Hey, <strong>{user.username}</strong>!
            </span>
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
