import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api/transactions/';


export const fetchTransactions = createAsyncThunk('transactions/fetch', async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Błąd pobierania danych');
  return response.json();
});


export const addTransactionAPI = createAsyncThunk('transactions/add', async (transaction) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  return response.json();
});


export const updateTransactionAPI = createAsyncThunk('transactions/update', async (transaction) => {
  const response = await fetch(`${API_URL}${transaction.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  return response.json();
});


export const deleteTransactionAPI = createAsyncThunk('transactions/delete', async (id) => {
  await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
  return id;
});


const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    status: 'idle', 
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      
      .addCase(addTransactionAPI.fulfilled, (state, action) => {
        state.items.unshift(action.payload); 
      })
      
      .addCase(updateTransactionAPI.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      .addCase(deleteTransactionAPI.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export default transactionsSlice.reducer;