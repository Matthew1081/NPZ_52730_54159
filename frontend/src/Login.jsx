import React, { useState } from 'react';
import { useTheme, ThemeToggle } from './ThemeContext';

const Login = ({ onNavigate, onLogin }) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Wszystkie pola są wymagane.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Nieprawidłowy login lub hasło!');
      }

      const data = await response.json();

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('auth_user', JSON.stringify({ username }));

      setError('');
      onLogin({ username });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="auth-brand-panel anim-slide-left" style={{ background: theme.panelBg }}>
        <div style={{ color: theme.panelText, maxWidth: '420px', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🛡️</div>
          <h1 style={{
            fontSize: '32px', fontWeight: '700', lineHeight: '1.2',
            color: theme.panelText, margin: '0 0 16px 0',
          }}>Osobisty Asystent Finansowy</h1>
          <p style={{
            fontSize: '16px', color: theme.panelTextMuted,
            lineHeight: '1.6', marginBottom: '40px',
          }}>Bezpieczne zarządzanie Twoimi finansami w jednym miejscu</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px', color: theme.panelFeature, letterSpacing: '0.3px' }} className="anim-fade-up anim-delay-2">✓ Pełna kontrola nad budżetem</div>
            <div style={{ fontSize: '14px', color: theme.panelFeature, letterSpacing: '0.3px' }} className="anim-fade-up anim-delay-3">✓ Śledzenie transakcji w czasie rzeczywistym</div>
            <div style={{ fontSize: '14px', color: theme.panelFeature, letterSpacing: '0.3px' }} className="anim-fade-up anim-delay-4">✓ Automatyczne przeliczanie walut</div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel anim-slide-right" style={{ backgroundColor: theme.bg }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '32px' }} className="anim-fade-in anim-delay-1">
            <h2 style={{
              margin: '0 0 8px 0', color: theme.text,
              fontSize: '28px', fontWeight: '700',
            }}>Witaj ponownie</h2>
            <p style={{ color: theme.textSecondary, fontSize: '15px', margin: 0 }}>
              Zaloguj się do swojego konta
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: theme.errorBg, color: theme.errorText,
              padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
              fontSize: '14px', border: `1px solid ${theme.errorBorder}`,
            }} className="anim-scale-in">{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="anim-fade-up anim-delay-2">
              <label htmlFor="username" style={{
                fontSize: '13px', fontWeight: '600', color: theme.labelColor,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Nazwa użytkownika</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>👤</span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-focus"
                  style={{
                    width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px',
                    border: `1.5px solid ${theme.inputBorder}`, boxSizing: 'border-box',
                    fontSize: '15px', outline: 'none', backgroundColor: theme.inputBg,
                    color: theme.text,
                  }}
                  placeholder="Wprowadź nazwę użytkownika"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="anim-fade-up anim-delay-3">
              <label htmlFor="password" style={{
                fontSize: '13px', fontWeight: '600', color: theme.labelColor,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>Hasło</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>🔒</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-focus"
                  style={{
                    width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px',
                    border: `1.5px solid ${theme.inputBorder}`, boxSizing: 'border-box',
                    fontSize: '15px', outline: 'none', backgroundColor: theme.inputBg,
                    color: theme.text,
                  }}
                  placeholder="Wprowadź hasło"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-hover anim-fade-up anim-delay-4" style={{
              width: '100%', padding: '14px', background: theme.btnPrimary,
              color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600',
              cursor: 'pointer', fontSize: '16px', letterSpacing: '0.5px', marginTop: '8px',
              boxShadow: `0 4px 14px ${theme.btnPrimaryShadow}`,
            }}>Zaloguj się</button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0',
          }} className="anim-fade-in anim-delay-4">
            <span style={{ flex: 1, height: '1px', backgroundColor: theme.divider }}></span>
            <span style={{ color: theme.textMuted, fontSize: '13px', fontWeight: '500' }}>lub</span>
            <span style={{ flex: 1, height: '1px', backgroundColor: theme.divider }}></span>
          </div>

          <p style={{ textAlign: 'center', color: theme.textSecondary, fontSize: '14px', margin: 0 }} className="anim-fade-in anim-delay-5">
            Nie masz jeszcze konta?{' '}
            <span onClick={() => onNavigate('register')} className="link-hover" style={{
              color: theme.linkColor, cursor: 'pointer', fontWeight: '700',
              textDecoration: 'underline', textUnderlineOffset: '2px',
            }}>
              Utwórz konto
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
