import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const light = {
  bg: '#f8f9fb',
  bgAlt: '#f1f5f9',
  card: '#fff',
  cardAlt: '#fafbfc',
  cardBorder: '#f1f5f9',
  text: '#0a1628',
  textSecondary: '#6b7280',
  textMuted: '#94a3b8',
  inputBg: '#f9fafb',
  inputBorder: '#e5e7eb',
  inputFocusBg: '#fff',
  divider: '#e5e7eb',
  navBg: 'linear-gradient(135deg, #0a1628 0%, #1a2940 100%)',
  navText: '#fff',
  navSubtext: 'rgba(255,255,255,0.5)',
  panelBg: 'linear-gradient(135deg, #0a1628 0%, #1a2940 50%, #0d2137 100%)',
  panelText: '#fff',
  panelTextMuted: 'rgba(255,255,255,0.7)',
  panelFeature: 'rgba(255,255,255,0.8)',
  btnPrimary: 'linear-gradient(135deg, #1a2940 0%, #0d2137 100%)',
  btnPrimaryShadow: 'rgba(10, 22, 40, 0.3)',
  labelColor: '#374151',
  linkColor: '#1a2940',
  errorBg: '#fef2f2',
  errorText: '#991b1b',
  errorBorder: '#fecaca',
  successBg: '#f0fdf4',
  successText: '#166534',
  successBorder: '#bbf7d0',
  badgeBg: '#f3f4f6',
  badgeText: '#9ca3af',
  shadow: '0 1px 3px rgba(0,0,0,0.06)',
  shadowHover: '0 8px 24px rgba(0,0,0,0.1)',
  userAvatarBg: 'rgba(255,255,255,0.15)',
  logoutBg: 'rgba(255,255,255,0.1)',
  logoutBorder: 'rgba(255,255,255,0.2)',
  transactionHoverBg: '#f0f4f8',
  actionHoverBg: '#e5e7eb',
  cancelBg: '#f3f4f6',
  cancelBorder: '#e5e7eb',
  cancelText: '#6b7280',
};

const dark = {
  bg: '#0f1724',
  bgAlt: '#0b1120',
  card: '#1a2332',
  cardAlt: '#1e2a3a',
  cardBorder: '#2a3545',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  inputBg: '#1e2a3a',
  inputBorder: '#334155',
  inputFocusBg: '#243044',
  divider: '#2a3545',
  navBg: 'linear-gradient(135deg, #0b1120 0%, #162032 100%)',
  navText: '#e2e8f0',
  navSubtext: 'rgba(226,232,240,0.5)',
  panelBg: 'linear-gradient(135deg, #0b1120 0%, #162032 50%, #0f1928 100%)',
  panelText: '#e2e8f0',
  panelTextMuted: 'rgba(226,232,240,0.6)',
  panelFeature: 'rgba(226,232,240,0.7)',
  btnPrimary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  btnPrimaryShadow: 'rgba(37, 99, 235, 0.3)',
  labelColor: '#cbd5e1',
  linkColor: '#60a5fa',
  errorBg: '#2d1b1b',
  errorText: '#fca5a5',
  errorBorder: '#5c2020',
  successBg: '#1a2e1a',
  successText: '#86efac',
  successBorder: '#2d5a2d',
  badgeBg: '#1e2a3a',
  badgeText: '#64748b',
  shadow: '0 1px 3px rgba(0,0,0,0.3)',
  shadowHover: '0 8px 24px rgba(0,0,0,0.4)',
  userAvatarBg: 'rgba(255,255,255,0.1)',
  logoutBg: 'rgba(255,255,255,0.06)',
  logoutBorder: 'rgba(255,255,255,0.12)',
  transactionHoverBg: '#243044',
  actionHoverBg: '#334155',
  cancelBg: '#1e2a3a',
  cancelBorder: '#334155',
  cancelText: '#94a3b8',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme_dark');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('theme_dark', JSON.stringify(isDark));
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);
  const theme = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle({ style }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      style={{
        position: 'relative',
        width: '56px',
        height: '28px',
        borderRadius: '14px',
        border: 'none',
        cursor: 'pointer',
        background: isDark
          ? 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)'
          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        boxShadow: isDark
          ? '0 2px 8px rgba(37, 99, 235, 0.3), inset 0 1px 2px rgba(0,0,0,0.2)'
          : '0 2px 8px rgba(245, 158, 11, 0.3), inset 0 1px 2px rgba(0,0,0,0.1)',
        padding: 0,
        outline: 'none',
        ...style,
      }}
      title={isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: isDark ? '31px' : '3px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          transition: 'left 0.3s cubic-bezier(0.68, -0.15, 0.27, 1.15)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
