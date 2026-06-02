import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('auth_user') ? 'home' : 'login';
  });

  
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
    localStorage.setItem('auth_user', JSON.stringify(userData)); 
  };

  
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    localStorage.removeItem('auth_user'); 
  };

  return (
    <div>
      {currentPage === 'login' && (
        <Login onNavigate={setCurrentPage} onLogin={handleLogin} />
      )}
      {currentPage === 'register' && (
        <Register onNavigate={setCurrentPage} />
      )}
      {currentPage === 'home' && (
        <Dashboard user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;