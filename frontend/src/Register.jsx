import React, { useState } from 'react';

const Register = ({ onNavigate }) => {
  const [email, setEmail] = useState('example@email.com');
  const [password, setPassword] = useState('password123!@#');
  const [confirmPassword, setConfirmPassword] = useState('password123!@#');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne.');
      return;
    }
    setError('');
    setSuccess(true);
    setTimeout(() => {
      onNavigate('login');
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Rejestracja</h1>
        <p style={styles.subtitle}>Utwórz darmowe konto</p>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={{...styles.error, backgroundColor: '#d4edda', color: '#155724'}}>Konto utworzone pomyślnie! Przekierowanie...</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>E-mail:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Hasło:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Powtórz hasło:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>Zarejestruj się</button>
        </form>

        <p style={styles.footerText}>
          Masz już konto?{' '}
          <span onClick={() => onNavigate('login')} style={styles.link}>
            Zaloguj się
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'Arial, sans-serif' },
  card: { background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { margin: '0 0 10px 0', color: '#333' },
  subtitle: { color: '#666', marginBottom: '30px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' },
  input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'left' },
  footerText: { marginTop: '20px', color: '#666' },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }
};

export default Register;