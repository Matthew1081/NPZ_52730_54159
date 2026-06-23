import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTransactions, addTransactionAPI, updateTransactionAPI, deleteTransactionAPI, syncOfflineTransactions, initFromDB } from './store/transactionsSlice';
import { useTheme, ThemeToggle } from './ThemeContext';

const Dashboard = ({ user, onNavigate, onLogout }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transactions.items);
  const status = useSelector((state) => state.transactions.status);
  const dbLoaded = useSelector((state) => state.transactions.dbLoaded);

  useEffect(() => {
    dispatch(initFromDB()).then(() => {
      if (navigator.onLine) {
        dispatch(syncOfflineTransactions()).then(() => {
          dispatch(fetchTransactions());
        });
      }
    });
  }, [dispatch]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [form, setForm] = useState({
    id: null, title: '', amount: '', type: 'expense',
    category: 'Jedzenie', currency: 'PLN',
    date: new Date().toISOString().split('T')[0]
  });

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Wszystkie');
  const [exchangeRates, setExchangeRates] = useState({ PLN: 1, USD: 4.0, EUR: 4.3 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('http://api.nbp.pl/api/exchangerates/tables/A/?format=json');
        if (!response.ok) throw new Error('Błąd NBP');
        const data = await response.json();
        const rates = data[0].rates;
        setExchangeRates({
          PLN: 1,
          USD: rates.find(r => r.code === 'USD').mid,
          EUR: rates.find(r => r.code === 'EUR').mid
        });
      } catch (error) {
        console.error("Używam domyślnych kursów walut.", error);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); dispatch(syncOfflineTransactions()); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [dispatch]);

  const convertToPLN = (amount, currency) => amount * (exchangeRates[currency] || 1);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + convertToPLN(t.amount, t.currency), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + convertToPLN(t.amount, t.currency), 0);
  const balance = totalIncome - totalExpense;

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) return;
    const { id, ...rest } = form;
    const payload = { ...rest, amount: parseFloat(form.amount) };
    if (id) {
      dispatch(updateTransactionAPI({ ...payload, id }));
    } else {
      dispatch(addTransactionAPI(payload)).unwrap().catch(err => {
        if (err && err.isOfflineObj) return;
        alert("Błąd zapisu: sprawdź konsolę (F12)");
      });
    }
    setForm({ id: null, title: '', amount: '', type: 'expense', category: 'Jedzenie', currency: 'PLN', date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (transaction) => setForm(transaction);
  const handleDelete = (id) => dispatch(deleteTransactionAPI(id));

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'Wszystkie' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const inputStyle = {
    padding: '12px 14px', borderRadius: '10px',
    border: `1.5px solid ${theme.inputBorder}`, boxSizing: 'border-box',
    fontSize: '14px', outline: 'none', backgroundColor: theme.inputBg,
    width: '100%', color: theme.text,
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  const fieldLabelStyle = {
    fontSize: '12px', fontWeight: '600', color: theme.textSecondary,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bgAlt, fontFamily: "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <nav className="dash-navbar navbar-anim" style={{ background: theme.navBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '28px' }}>🏦</span>
          <div>
            <h2 style={{ margin: 0, color: theme.navText, fontSize: '18px', fontWeight: '700', letterSpacing: '0.3px' }}>Osobisty Asystent Finansowy</h2>
            <span style={{ color: theme.navSubtext, fontSize: '12px', fontWeight: '400' }}>Panel zarządzania</span>
          </div>
        </div>
        <div className="dash-nav-actions">
          <ThemeToggle />
          <span className="status-pulse" style={{
            padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            backgroundColor: isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: isOnline ? '#16a34a' : '#dc2626',
            border: `1px solid ${isOnline ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {isOnline ? '● Online' : '● Offline'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: theme.userAvatarBg, color: theme.navText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700',
            }}>{(user?.username || 'G')[0].toUpperCase()}</span>
            <span className="dash-nav-username" style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
              {user?.username || user?.email || 'Gość'}
            </span>
          </div>
          <button onClick={onLogout} className="btn-logout-hover" style={{
            padding: '8px 18px', backgroundColor: theme.logoutBg,
            color: 'rgba(255,255,255,0.9)', border: `1px solid ${theme.logoutBorder}`,
            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          }}>Wyloguj</button>
        </div>
      </nav>

      <div className="dash-stats-grid">
        {[
          { label: 'Przychody', value: totalIncome, color: '#16a34a', icon: '↑', delay: '1' },
          { label: 'Wydatki', value: totalExpense, color: '#dc2626', icon: '↓', delay: '2' },
          { label: 'Stan konta', value: balance, color: isDarkColor(theme) ? '#60a5fa' : '#1a2940', icon: '◆', delay: '3' },
        ].map(({ label, value, color, icon, delay }) => (
          <div key={label} className={`stat-card-anim card-hover anim-delay-${delay}`} style={{
            flex: 1, minWidth: '0', backgroundColor: theme.card,
            padding: '24px', borderRadius: '14px', boxShadow: theme.shadow,
            borderTop: `3px solid ${color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{
                width: '36px', height: '36px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: '700',
                backgroundColor: `${color}18`, color,
              }}>{icon}</span>
              <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>{label}</span>
            </div>
            <p className="dash-stat-value" style={{ fontSize: '28px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px', color }}>
              {value.toFixed(2)} <span style={{ fontSize: '16px', fontWeight: '500', opacity: 0.7 }}>PLN</span>
            </p>
          </div>
        ))}
      </div>

      <div className="dash-main-grid">
        <div style={{
          background: theme.card, padding: '28px', borderRadius: '14px',
          boxShadow: theme.shadow, flex: 1, minWidth: '0',
        }} className="anim-fade-up anim-delay-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.text }}>
              {form.id ? 'Edytuj transakcję' : 'Nowa transakcja'}
            </h3>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={fieldLabelStyle}>Nazwa</label>
              <input type="text" placeholder="Np. Zakupy spożywcze" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                style={inputStyle} className="input-focus" required />
            </div>
            <div className="dash-form-row" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
                <label style={fieldLabelStyle}>Kwota</label>
                <input type="number" placeholder="0.00" value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  style={inputStyle} className="input-focus" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={fieldLabelStyle}>Waluta</label>
                <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                  style={selectStyle} className="input-focus">
                  <option value="PLN">PLN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div className="dash-form-row" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={fieldLabelStyle}>Typ</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  style={selectStyle} className="input-focus">
                  <option value="expense">Wydatek</option>
                  <option value="income">Przychód</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={fieldLabelStyle}>Kategoria</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  style={selectStyle} className="input-focus">
                  <option value="Jedzenie">Jedzenie</option>
                  <option value="Praca">Praca / Zarobki</option>
                  <option value="Rozrywka">Rozrywka</option>
                  <option value="Inne">Inne</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={fieldLabelStyle}>Data</label>
              <input type="date" value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                style={inputStyle} className="input-focus" required />
            </div>
            <button type="submit" className="btn-hover" style={{
              padding: '14px', color: '#fff', border: 'none', borderRadius: '10px',
              fontWeight: '600', cursor: 'pointer', fontSize: '15px', marginTop: '4px',
              boxShadow: `0 4px 14px ${theme.btnPrimaryShadow}`,
              background: form.id
                ? 'linear-gradient(135deg, #b45309 0%, #d97706 100%)'
                : theme.btnPrimary,
            }}>
              {form.id ? 'Zaktualizuj' : 'Dodaj transakcję'}
            </button>
            {form.id && (
              <button type="button" className="btn-secondary-hover"
                onClick={() => setForm({ id: null, title: '', amount: '', type: 'expense', category: 'Jedzenie', currency: 'PLN', date: new Date().toISOString().split('T')[0] })}
                style={{
                  padding: '12px', color: theme.cancelText, backgroundColor: theme.cancelBg,
                  border: `1px solid ${theme.cancelBorder}`, borderRadius: '10px',
                  fontWeight: '500', cursor: 'pointer', fontSize: '14px',
                }}>
                Anuluj
              </button>
            )}
          </form>
        </div>

        <div style={{
          background: theme.card, padding: '28px', borderRadius: '14px',
          boxShadow: theme.shadow, flex: 2, minWidth: '0',
        }} className="anim-fade-up anim-delay-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.text }}>Historia transakcji</h3>
            <span style={{
              fontSize: '13px', color: theme.badgeText, fontWeight: '500',
              backgroundColor: theme.badgeBg, padding: '4px 12px', borderRadius: '20px',
            }}>{filteredTransactions.length} wpisów</span>
          </div>
          <div className="dash-filters-row">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 2 }}>
              <span style={{ position: 'absolute', left: '14px', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
              <input type="text" placeholder="Szukaj transakcji..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-focus"
                style={{ ...inputStyle, paddingLeft: '40px' }} />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              style={{ ...selectStyle, flex: 1 }} className="input-focus">
              <option value="Wszystkie">Wszystkie</option>
              <option value="Jedzenie">Jedzenie</option>
              <option value="Praca">Praca / Zarobki</option>
              <option value="Rozrywka">Rozrywka</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }} className="anim-fade-in">
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📋</span>
                <p style={{ color: theme.textMuted, fontSize: '15px', margin: 0 }}>Brak wpisów do wyświetlenia</p>
              </div>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} className="dash-transaction-item transaction-hover anim-fade-up" style={{
                  border: `1px solid ${theme.cardBorder}`, backgroundColor: theme.cardAlt,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: '700', flexShrink: 0,
                      backgroundColor: t.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                      color: t.type === 'income' ? '#16a34a' : '#dc2626',
                    }}>
                      {t.type === 'income' ? '↑' : '↓'}
                    </span>
                    <div>
                      <div style={{
                        fontSize: '15px', fontWeight: '600', color: theme.text,
                        display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                      }}>
                        {t.title}
                        {t.isOffline && (
                          <span style={{
                            fontSize: '11px', color: '#d97706',
                            backgroundColor: 'rgba(217,119,6,0.1)',
                            padding: '2px 8px', borderRadius: '10px', fontWeight: '500',
                          }}>oczekuje na sync</span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '2px' }}>
                        {t.category} · {t.date}
                      </div>
                    </div>
                  </div>
                  <div className="dash-transaction-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: '700', fontSize: '15px', display: 'block',
                        color: t.type === 'income' ? '#16a34a' : '#dc2626',
                      }}>
                        {t.type === 'income' ? '+' : '-'}{t.amount} {t.currency}
                      </span>
                      {t.currency !== 'PLN' && (
                        <span style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', display: 'block' }}>
                          ≈ {(convertToPLN(t.amount, t.currency)).toFixed(2)} PLN
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleEdit(t)} className="action-btn-hover"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px', borderRadius: '8px' }}
                        title="Edytuj">✏️</button>
                      <button onClick={() => handleDelete(t.id)} className="action-btn-hover"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px', borderRadius: '8px' }}
                        title="Usuń">🗑️</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function isDarkColor(theme) {
  return theme.bg === '#0f1724';
}

export default Dashboard;
