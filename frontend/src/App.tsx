// App.tsx - Main React app entry point for EquiLearn
// Handles routing, user state, and global app logic.
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DonorDashboard from './pages/DonorDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import Impact from './pages/Impact';
import { User } from './types';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>(() => {
    const stored = localStorage.getItem('recentDonations');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('recentDonations', JSON.stringify(recentDonations));
  }, [recentDonations]);

  // Restore user from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setRecentDonations([]); // Clear donations for new user
    localStorage.removeItem('recentDonations'); // Remove from storage
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div className="App">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={
                currentUser?.role === 'donor' ? 
                <DonorDashboard 
                  user={currentUser} 
                  onUserTotalDonatedChange={(total) => {
                    setCurrentUser(u => {
                      if (!u) return u;
                      const updated = { ...u, totalDonated: total };
                      localStorage.setItem('currentUser', JSON.stringify(updated));
                      return updated;
                    });
                  }}
                  recentDonations={recentDonations}
                  setRecentDonations={setRecentDonations}
                /> : 
                <Home />
              } 
            />
            <Route 
              path="/impact"
              element={<Impact recentDonations={recentDonations} />}
            />
            <Route 
              path="/admin" 
              element={
                currentUser?.role === 'admin' ? 
                <AdminPanel /> : 
                <Home />
              } 
            />
            <Route 
              path="/login" 
              element={<Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={<Register onLogin={handleLogin} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
