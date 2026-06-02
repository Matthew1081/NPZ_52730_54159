import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  // Domyślnie startujemy na ekranie logowania
  const [currentPage, setCurrentPage] = useState('login');
  // Tutaj będziemy przechowywać dane zalogowanego użytkownika
  const [user, setUser] = useState(null);

  // Funkcja wywoływana przy poprawnym logowaniu
  const handleLogin = (userData) => {
    setUser(userData);      // Zapisujemy dane użytkownika (np. email)
    setCurrentPage('home'); // Przełączamy ekran na główny panel
  };

  // Funkcja wywoływana przy wylogowaniu
  const handleLogout = () => {
    setUser(null);          // Czyszczenie danych użytkownika
    setCurrentPage('login'); // Powrót do ekranu logowania
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