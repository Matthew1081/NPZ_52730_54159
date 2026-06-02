import React, { useState } from 'react';

const Login = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('example@email.com');
  const [password, setPassword] = useState('password123!@#');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Wszystkie pola są wymagane.'); [cite: 4]
      return;
    }
    setError('');
    // Tutaj w przyszłości trafi logika przekazania tokenu JWT 
    onLogin({ email });
    onNavigate('home');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Zaloguj się</h1>
        <p style={styles.subtitle}>Osobisty Asystent Finansowy</p> 
        
        {error && <div style={styles.error}>{error}</div>}

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

          <button type="submit" style={styles.button}>Zaloguj się</button>
        </form>

        <p style={styles.footerText}>
          Nie masz konta?{' '}
          <span onClick={() => onNavigate('register')} style={styles.link}>
            Zarejestruj się
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
  input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid '#ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'left' },
  footerText: { marginTop: '20px', color: '#666' },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;