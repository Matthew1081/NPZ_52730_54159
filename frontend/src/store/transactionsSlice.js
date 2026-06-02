import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api/transactions/';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const loadOfflineQueue = () => {
  const saved = localStorage.getItem('offline_transactions');
  return saved ? JSON.parse(saved) : [];
};

const loadCachedTransactions = () => {
  const saved = localStorage.getItem('cached_transactions');
  return saved ? JSON.parse(saved) : [];
};

export const fetchTransactions = createAsyncThunk('transactions/fetch', async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Błąd pobierania danych');
  return response.json();
});

export const addTransactionAPI = createAsyncThunk('transactions/add', async (transaction, { rejectWithValue }) => {
  
  if (!navigator.onLine) {
    const offlineTx = { ...transaction, id: `temp-${Date.now()}`, isOffline: true };
    return rejectWithValue({ isOfflineObj: true, data: offlineTx });
  }

  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Błąd dodawania');
    return await response.json();
  } catch (error) {
    const offlineTx = { ...transaction, id: `temp-${Date.now()}`, isOffline: true };
    return rejectWithValue({ isOfflineObj: true, data: offlineTx });
  }
});

export const updateTransactionAPI = createAsyncThunk('transactions/update', async (transaction) => {
  const response = await fetch(`${API_URL}${transaction.id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Błąd aktualizacji');
  return response.json();
});

export const deleteTransactionAPI = createAsyncThunk('transactions/delete', async (id) => {
  const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Błąd usuwania');
  return id;
});

export const syncOfflineTransactions = createAsyncThunk(
  'transactions/sync',
  async (_, { getState, dispatch }) => {
    const { offlineQueue } = getState().transactions;
    if (offlineQueue.length === 0) return;

    let hasError = false;

    for (const tx of offlineQueue) {
      const { id, isOffline, ...payload } = tx;
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          hasError = true;
          break; 
        }
      } catch (err) {
        hasError = true;
        break; 
      }
    }

    
    if (hasError) {
      throw new Error("Synchronizacja przerwana (brak stabilnego łącza z backendem)");
    }

    
    dispatch(fetchTransactions());
  },
  {
    condition: (_, { getState }) => {
      const { transactions } = getState();
      if (transactions.isSyncing || transactions.offlineQueue.length === 0) return false;
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    
    items: [...loadOfflineQueue(), ...loadCachedTransactions()],
    offlineQueue: loadOfflineQueue(),
    status: 'idle',
    isSyncing: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = [...state.offlineQueue, ...action.payload];
        localStorage.setItem('cached_transactions', JSON.stringify(action.payload));
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.status = 'failed';
       
      })
      .addCase(addTransactionAPI.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        const cached = loadCachedTransactions();
        cached.unshift(action.payload);
        localStorage.setItem('cached_transactions', JSON.stringify(cached));
      })
      .addCase(addTransactionAPI.rejected, (state, action) => {
        if (action.payload && action.payload.isOfflineObj) {
          const newTx = action.payload.data;
          state.offlineQueue.push(newTx);
          state.items.unshift(newTx);
          
          localStorage.setItem('offline_transactions', JSON.stringify(current(state.offlineQueue)));
        }
      })
      .addCase(updateTransactionAPI.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTransactionAPI.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      })
      .addCase(syncOfflineTransactions.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncOfflineTransactions.fulfilled, (state) => {
        state.isSyncing = false;
        
        state.offlineQueue = [];
        localStorage.removeItem('offline_transactions');
      })
      .addCase(syncOfflineTransactions.rejected, (state) => {
        state.isSyncing = false;
        
      });
  },
});

export default transactionsSlice.reducer;