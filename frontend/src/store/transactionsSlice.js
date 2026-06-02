import { createSlice } from '@reduxjs/toolkit';

// Tymczasowo ładujemy dane z pamięci przeglądarki, symulując tryb offline
const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('offline_transactions');
  return saved ? JSON.parse(saved) : [];
};

const initialState = {
  items: loadFromLocalStorage(),
  isSyncing: false,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      state.items.push(action.payload);
      localStorage.setItem('offline_transactions', JSON.stringify(state.items));
    },
    updateTransaction: (state, action) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        localStorage.setItem('offline_transactions', JSON.stringify(state.items));
      }
    },
    deleteTransaction: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      localStorage.setItem('offline_transactions', JSON.stringify(state.items));
    },
    // W przyszłości wywołamy tę akcję po odzyskaniu połączenia z API
    setSyncStatus: (state, action) => {
      state.isSyncing = action.payload;
    }
  },
});

export const { addTransaction, updateTransaction, deleteTransaction, setSyncStatus } = transactionsSlice.actions;
export default transactionsSlice.reducer;