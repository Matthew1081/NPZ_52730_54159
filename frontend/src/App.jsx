import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import { ThemeProvider, useTheme } from './ThemeContext';

const globalCSS = `
*, *::before, *::after { box-sizing: border-box; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.anim-fade-in { animation: fadeIn 0.5s ease-out both; }
.anim-slide-left { animation: slideInLeft 0.6s ease-out both; }
.anim-slide-right { animation: slideInRight 0.6s ease-out both; }
.anim-scale-in { animation: scaleIn 0.4s ease-out both; }
.anim-fade-up { animation: fadeInUp 0.5s ease-out both; }

.anim-delay-1 { animation-delay: 0.1s; }
.anim-delay-2 { animation-delay: 0.2s; }
.anim-delay-3 { animation-delay: 0.3s; }
.anim-delay-4 { animation-delay: 0.4s; }
.anim-delay-5 { animation-delay: 0.5s; }

.btn-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
}
.btn-hover:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(10, 22, 40, 0.35) !important;
}
.btn-hover:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 8px rgba(10, 22, 40, 0.2) !important;
}

.btn-secondary-hover {
  transition: background-color 0.2s ease, transform 0.15s ease !important;
}
.btn-secondary-hover:hover {
  transform: translateY(-1px) !important;
}

.btn-logout-hover {
  transition: background-color 0.2s ease, border-color 0.2s ease !important;
}
.btn-logout-hover:hover {
  background-color: rgba(255,255,255,0.2) !important;
  border-color: rgba(255,255,255,0.4) !important;
}

.input-focus {
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease !important;
}

.card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease !important;
}
.card-hover:hover {
  transform: translateY(-4px) !important;
}

.transaction-hover {
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease !important;
}
.transaction-hover:hover {
  transform: translateX(4px) !important;
}

.action-btn-hover {
  transition: background-color 0.15s ease, transform 0.15s ease !important;
}
.action-btn-hover:hover {
  transform: scale(1.15) !important;
}

.link-hover {
  transition: color 0.2s ease, text-decoration-color 0.2s ease !important;
}

.navbar-anim { animation: fadeIn 0.4s ease-out both; }

.stat-card-anim {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out both;
}

.status-pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.theme-toggle {
  transition: background 0.3s ease, box-shadow 0.3s ease !important;
}

* {
  transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* ===================== RESPONSIVE ===================== */

/* --- Auth (Login / Register) --- */
.auth-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
.auth-brand-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}
.auth-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* --- Dashboard --- */
.dash-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: auto;
  min-height: 68px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
.dash-nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.dash-stats-grid {
  display: flex;
  gap: 20px;
  padding: 24px 32px;
  flex-wrap: wrap;
}
.dash-main-grid {
  display: flex;
  gap: 20px;
  padding: 0 32px 32px 32px;
  flex-wrap: wrap;
}
.dash-filters-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.dash-transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
}
.dash-nav-username { display: inline; }
.dash-stat-value { font-size: 28px; }

/* ========== TABLET (<=900px) ========== */
@media (max-width: 900px) {
  .auth-brand-panel { display: none !important; }
  .auth-form-panel { flex: unset !important; width: 100% !important; padding: 32px 24px !important; }
  .auth-container { flex-direction: column !important; }

  .dash-navbar { padding: 12px 16px !important; flex-wrap: wrap; gap: 12px; }
  .dash-nav-actions { flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
  .dash-stats-grid { padding: 16px !important; gap: 12px !important; }
  .dash-main-grid { padding: 0 16px 24px 16px !important; flex-direction: column !important; }
  .dash-filters-row { flex-direction: column !important; }
}

/* ========== MOBILE (<=600px) ========== */
@media (max-width: 600px) {
  .auth-form-panel { padding: 24px 16px !important; }

  .dash-navbar { padding: 10px 12px !important; }
  .dash-nav-username { display: none !important; }
  .dash-nav-actions { gap: 8px; }
  .dash-stats-grid {
    flex-direction: column !important;
    padding: 12px !important;
    gap: 10px !important;
  }
  .dash-stat-value { font-size: 22px !important; }
  .dash-main-grid { padding: 0 12px 20px 12px !important; }
  .dash-transaction-item {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
  }
  .dash-transaction-right {
    width: 100%;
    justify-content: space-between !important;
  }
  .dash-form-row {
    flex-direction: column !important;
  }
}
`;

function AppInner() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('auth_user') ? 'home' : 'login';
  });

  const { isDark } = useTheme();

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'global-animations';
    styleEl.textContent = globalCSS;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#0b1120' : '#f8f9fb';
    document.body.style.margin = '0';
  }, [isDark]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');

    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    window.location.reload();
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

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
