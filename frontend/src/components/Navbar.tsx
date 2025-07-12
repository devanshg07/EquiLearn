import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import './Navbar.css';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EquiLearn
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          
          {currentUser?.role === 'donor' && (
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          )}
          
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="navbar-link">Admin</Link>
          )}
        </div>

        <div className="navbar-auth">
          {currentUser ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {currentUser.name}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">
                    <span>Welcome, {currentUser.name}</span>
                  </div>
                  {currentUser.role === 'donor' && (
                    <div className="dropdown-item">
                      <span>Total Donated: ${currentUser.totalDonated}</span>
                    </div>
                  )}
                  <button 
                    className="dropdown-item logout-button"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link">Sign Up / Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 