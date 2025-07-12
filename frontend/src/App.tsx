import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Schools from './pages/Schools';
import DonorDashboard from './pages/DonorDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import ClipboardDemo from './components/ClipboardDemo';
import { User } from './types';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <ClipboardDemo />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schools" element={<Schools />} />
            <Route 
              path="/dashboard" 
              element={
                currentUser?.role === 'donor' ? 
                <DonorDashboard user={currentUser} /> : 
                <Home />
              } 
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
              element={<Register onRegister={handleLogin} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
