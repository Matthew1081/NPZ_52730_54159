import React, { useState } from 'react';
import { useTheme, ThemeToggle } from './ThemeContext';

const Register = ({ onNavigate }) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const details = errData.details || errData;
        const firstError = Object.values(details).flat().find(msg => typeof msg === 'string');
        throw new Error(firstError || 'Błąd rejestracji. Spróbuj innych danych.');
      }

      setError('');
      setSuccess(true);

      setTimeout(() => {
        onNavigate('login');
      }, 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px',
    border: `1.5px solid ${theme.inputBorder}`, boxSizing: 'border-box',
    fontSize: '15px', outline: 'none', backgroundColor: theme.inputBg,
    color: theme.text,
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '600', color: theme.labelColor,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="auth-brand-panel anim-slide-left" style={{ background: theme.panelBg }}>
        <div style={{ color: theme.panelText, maxWidth: '420px', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🏦</div>
          <h1 style={{
            fontSize: '32px', fontWeight: '700', lineHeight: '1.2',
            color: theme.panelText, margin: '0 0 16px 0',
          }}>Dołącz do nas</h1>
          <p style={{
            fontSize: '16px', color: theme.panelTextMuted,
            lineHeight: '1.6', marginBottom: '40px',
          }}>Zacznij kontrolować swoje finanse już dziś. Rejestracja jest szybka i darmowa.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px', color: theme.panelFeature, letterSpacing: '0.3px' }} className="anim-fade-up anim-delay-2">✓ Darmowe konto na zawsze</div>
            <div style={{ fontSize: '14px', color: theme.panelFeature, letterSpacing: '0.3px' }} className="anim-fade-up anim-delay-3">✓ Bezpieczne szyfrowanie danych</div>
            <div style={{ fontSize: '14px', color: theme.panelFeature, letterSpacing: '0.3px' }} className="anim-fade-up anim-delay-4">✓ Dostęp z każdego urządzenia</div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel anim-slide-right" style={{ backgroundColor: theme.bg }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '28px' }} className="anim-fade-in anim-delay-1">
            <h2 style={{
              margin: '0 0 8px 0', color: theme.text,
              fontSize: '28px', fontWeight: '700',
            }}>Utwórz konto</h2>
            <p style={{ color: theme.textSecondary, fontSize: '15px', margin: 0 }}>
              Wypełnij formularz aby rozpocząć
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: theme.errorBg, color: theme.errorText,
              padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
              fontSize: '14px', border: `1px solid ${theme.errorBorder}`,
            }} className="anim-scale-in">{error}</div>
          )}
          {success && (
            <div style={{
              backgroundColor: theme.successBg, color: theme.successText,
              padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
              fontSize: '14px', border: `1px solid ${theme.successBorder}`,
            }} className="anim-scale-in">Konto utworzone pomyślnie! Przekierowanie...</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="anim-fade-up anim-delay-1">
              <label htmlFor="username" style={labelStyle}>Nazwa użytkownika</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>👤</span>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle} className="input-focus" placeholder="Wybierz nazwę użytkownika" required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="anim-fade-up anim-delay-2">
              <label htmlFor="email" style={labelStyle}>Adres e-mail</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>✉️</span>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle} className="input-focus" placeholder="twoj@email.pl" required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="anim-fade-up anim-delay-3">
              <label htmlFor="password" style={labelStyle}>Hasło</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>🔒</span>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle} className="input-focus" placeholder="Minimum 8 znaków" required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="anim-fade-up anim-delay-4">
              <label htmlFor="confirmPassword" style={labelStyle}>Potwierdź hasło</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>🔒</span>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle} className="input-focus" placeholder="Powtórz hasło" required />
              </div>
            </div>

            <button type="submit" className="btn-hover anim-fade-up anim-delay-5" style={{
              width: '100%', padding: '14px', background: theme.btnPrimary,
              color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600',
              cursor: 'pointer', fontSize: '16px', letterSpacing: '0.5px', marginTop: '8px',
              boxShadow: `0 4px 14px ${theme.btnPrimaryShadow}`,
            }}>Zarejestruj się</button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0',
          }} className="anim-fade-in anim-delay-5">
            <span style={{ flex: 1, height: '1px', backgroundColor: theme.divider }}></span>
            <span style={{ color: theme.textMuted, fontSize: '13px', fontWeight: '500' }}>lub</span>
            <span style={{ flex: 1, height: '1px', backgroundColor: theme.divider }}></span>
          </div>

          <p style={{ textAlign: 'center', color: theme.textSecondary, fontSize: '14px', margin: 0 }} className="anim-fade-in anim-delay-5">
            Masz już konto?{' '}
            <span onClick={() => onNavigate('login')} className="link-hover" style={{
              color: theme.linkColor, cursor: 'pointer', fontWeight: '700',
              textDecoration: 'underline', textUnderlineOffset: '2px',
            }}>
              Zaloguj się
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
