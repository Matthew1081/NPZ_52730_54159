import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
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