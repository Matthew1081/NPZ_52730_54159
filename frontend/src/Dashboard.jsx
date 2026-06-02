import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onNavigate, onLogout }) => {
  // Stan sieci (Wymaganie: Tryb Offline i Synchronizacja)
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Przykładowe dane transakcji w stanie aplikacji
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Wynagrodzenie', amount: 5000, type: 'income', category: 'Praca', currency: 'PLN', date: '2026-06-01' },
    { id: 2, title: 'Zakupy spożywcze', amount: 150, type: 'expense', category: 'Jedzenie', currency: 'PLN', date: '2026-06-02' },
    { id: 3, title: 'Obiad w Berlinie', amount: 25, type: 'expense', category: 'Rozrywka', currency: 'EUR', date: '2026-06-02' } // Przykład obcej waluty
  ]);

  // Stan formularza CRUD
  const [form, setForm] = useState({ id: null, title: '', amount: '', type: 'expense', category: 'Jedzenie', currency: 'PLN', date: '' });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Wszystkie');

  // Kursy walut (Symulacja pobierania z NBP API / Exchange Rate-API)
  const exchangeRates = { PLN: 1, USD: 4.0, EUR: 4.3 };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Obliczanie statystyk (automatyczne przeliczanie obcych walut na PLN)
  const convertToPLN = (amount, currency) => amount * (exchangeRates[currency] || 1);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + convertToPLN(t.amount, t.currency), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + convertToPLN(t.amount, t.currency), 0);

  const balance = totalIncome - totalExpense;

  // Obsługa zapisu (Create / Update)
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) return;

    if (form.id) {
      // Update
      setTransactions(transactions.map(t => t.id === form.id ? { ...form, amount: parseFloat(form.amount) } : t));
    } else {
      // Create
      const newTransaction = { ...form, id: Date.now(), amount: parseFloat(form.amount) };
      setTransactions([...transactions, newTransaction]);
    }
    // Reset formularza
    setForm({ id: null, title: '', amount: '', type: 'expense', category: 'Jedzenie', currency: 'PLN', date: '' });
  };

  // Edycja (Wypełnienie formularza danymi)
  const handleEdit = (transaction) => {
    setForm(transaction);
  };

  // Usuwanie (Delete)
  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Filtrowanie (Read z wyszukiwaniem)
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'Wszystkie' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={dashStyles.container}>
      {/* Pasek Nawigacji */}
      <nav style={dashStyles.navbar}>
        <h2>Osobisty Asystent Finansowy</h2> 
        <div style={dashStyles.navActions}>
          <span style={{
            ...dashStyles.statusBadge, 
            backgroundColor: isOnline ? '#28a745' : '#dc3545'
          }}>
            {isOnline ? '● Online (Zsynchronizowano)' : '● Offline (Zapis lokalny)'} 
          </span>
          <span style={dashStyles.userEmail}>{user?.email || 'Gość'}</span>
          <button onClick={onLogout} style={dashStyles.logoutBtn}>Wyloguj</button>
        </div>
      </nav>

      {/* Panele Statystyk */}
      <div style={dashStyles.statsGrid}>
        <div style={{...dashStyles.statCard, borderLeft: '5px solid #28a745'}}>
          <h3>Przychody (w PLN)</h3> 
          <p style={{color: '#28a745', fontSize: '24px', fontWeight: 'bold'}}>{totalIncome.toFixed(2)} zł</p>
        </div>
        <div style={{...dashStyles.statCard, borderLeft: '5px solid #dc3545'}}>
          <h3>Wydatki (w PLN)</h3> 
          <p style={{color: '#dc3545', fontSize: '24px', fontWeight: 'bold'}}>{totalExpense.toFixed(2)} zł</p>
        </div>
        <div style={{...dashStyles.statCard, borderLeft: '5px solid #007bff'}}>
          <h3>Stan konta</h3>
          <p style={{color: '#007bff', fontSize: '24px', fontWeight: 'bold'}}>{balance.toFixed(2)} zł</p>
        </div>
      </div>

      <div style={dashStyles.mainGrid}>
        {/* Formularz Dodawania / Edycji */}
        <div style={dashStyles.card}>
          <h3>{form.id ? 'Edytuj transakcję' : 'Dodaj nową transakcję'}</h3> 
          <form onSubmit={handleSave} style={dashStyles.form}>
            <input 
              type="text" 
              placeholder="Nazwa transakcji" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              style={dashStyles.input} 
              required 
            />
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="number" 
                placeholder="Kwota" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                style={{...dashStyles.input, flex: 2}} 
                required 
              />
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={{...dashStyles.input, flex: 1}}>
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select> 
            </div>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={dashStyles.input}>
              <option value="expense">Wydatek</option>
              <option value="income">Przychód</option>
            </select> 
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={dashStyles.input}>
              <option value="Jedzenie">Jedzenie</option>
              <option value="Praca">Praca / Zarobki</option>
              <option value="Rozrywka">Rozrywka</option>
              <option value="Inne">Inne</option>
            </select>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm({...form, date: e.target.value})} 
              style={dashStyles.input} 
              required 
            />
            <button type="submit" style={{...dashStyles.btn, backgroundColor: form.id ? '#ffc107' : '#007bff'}}>
              {form.id ? 'Zaktualizuj wpis' : 'Dodaj wpis'} 
            </button>
            {form.id && <button type="button" onClick={() => setForm({ id: null, title: '', amount: '', type: 'expense', category: 'Jedzenie', currency: 'PLN', date: '' })} style={{...dashStyles.btn, backgroundColor: '#6c757d', marginTop: '5px'}}>Anuluj edycję</button>}
          </form>
        </div>

        {/* Historia Transakcji z filtrami */}
        <div style={{...dashStyles.card, flex: 2}}>
          <h3>Historia transakcji</h3> 
          
          {/* Filtry */}
          <div style={dashStyles.filtersContainer}>
            <input 
              type="text" 
              placeholder="Szukaj transakcji..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{...dashStyles.input, margin: 0, flex: 2}} 
            /> 
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{...dashStyles.input, margin: 0, flex: 1}}>
              <option value="Wszystkie">Wszystkie kategorie</option> 
              <option value="Jedzenie">Jedzenie</option>
              <option value="Praca">Praca / Zarobki</option>
              <option value="Rozrywka">Rozrywka</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          {/* Lista wpisów */}
          <div style={dashStyles.list}>
            {filteredTransactions.length === 0 ? <p style={{color: '#999'}}>Brak pasujących transakcji.</p> : (
              filteredTransactions.map(t => (
                <div key={t.id} style={dashStyles.listItem}>
                  <div>
                    <strong style={{fontSize: '16px'}}>{t.title}</strong>
                    <div style={{fontSize: '12px', color: '#777'}}>{t.category} • {t.date}</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <span style={{
                      fontWeight: 'bold', 
                      color: t.type === 'income' ? '#28a745' : '#dc3545'
                    }}>
                      {t.type === 'income' ? '+' : '-'} {t.amount} {t.currency}
                      {t.currency !== 'PLN' && <div style={{fontSize: '10px', color: '#777', textAlign: 'right'}}>≈ {(convertToPLN(t.amount, t.currency)).toFixed(2)} PLN</div>} 
                    </span>
                    <button onClick={() => handleEdit(t)} style={dashStyles.iconBtn}>✏️</button> 
                    <button onClick={() => handleDelete(t.id)} style={{...dashStyles.iconBtn, color: '#dc3545'}}>❌</button> 
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

const dashStyles = {
  container: { padding: '20px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' },
  navActions: { display: 'flex', alignItems: 'center', gap: '15px' },
  statusBadge: { color: '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  userEmail: { fontWeight: 'bold', color: '#555' },
  logoutBtn: { padding: '6px 12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  statsGrid: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  mainGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  card: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: 1, minWidth: '300px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '12px', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  filtersContainer: { display: 'flex', gap: '10px', marginBottom: '15px', marginTop: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #eee', borderRadius: '6px', backgroundColor: '#fafafa' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }
};

export default Dashboard;