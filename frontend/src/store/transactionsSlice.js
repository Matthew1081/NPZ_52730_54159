import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { getAllFromStore, putAllToStore, addToStore, clearStore } from '../db';

const API_URL = 'http://localhost:8000/api/transactions/';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const initFromDB = createAsyncThunk('transactions/initFromDB', async () => {
  const [cached, offline] = await Promise.all([
    getAllFromStore('transactions'),
    getAllFromStore('offlineQueue'),
  ]);
  return { cached, offline };
});

export const fetchTransactions = createAsyncThunk('transactions/fetch', async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Błąd pobierania danych');
  const data = await response.json();
  await putAllToStore('transactions', data);
  return data;
});

export const addTransactionAPI = createAsyncThunk('transactions/add', async (transaction, { rejectWithValue }) => {
  if (!navigator.onLine) {
    const offlineTx = { ...transaction, id: `temp-${Date.now()}`, isOffline: true };
    await addToStore('offlineQueue', offlineTx);
    return rejectWithValue({ isOfflineObj: true, data: offlineTx });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Błąd dodawania');
    const data = await response.json();
    await addToStore('transactions', data);
    return data;
  } catch (error) {
    const offlineTx = { ...transaction, id: `temp-${Date.now()}`, isOffline: true };
    await addToStore('offlineQueue', offlineTx);
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

    await clearStore('offlineQueue');
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
    items: [],
    offlineQueue: [],
    status: 'idle',
    isSyncing: false,
    error: null,
    dbLoaded: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initFromDB.fulfilled, (state, action) => {
        const { cached, offline } = action.payload;
        state.offlineQueue = offline;
        state.items = [...offline, ...cached];
        state.dbLoaded = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = [...state.offlineQueue, ...action.payload];
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(addTransactionAPI.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addTransactionAPI.rejected, (state, action) => {
        if (action.payload && action.payload.isOfflineObj) {
          const newTx = action.payload.data;
          state.offlineQueue.push(newTx);
          state.items.unshift(newTx);
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
      })
      .addCase(syncOfflineTransactions.rejected, (state) => {
        state.isSyncing = false;
      });
  },
});

export default transactionsSlice.reducer;
