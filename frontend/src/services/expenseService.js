import axios from 'axios';

const API_URL = 'http://localhost:5000/api/expenses';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to attach token from localStorage
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage (matching your AuthContext)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Sending request with token:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ No token found in localStorage!');
      console.log('Available localStorage keys:', Object.keys(localStorage));
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized - Token might be invalid or expired');
      console.error('Error details:', error.response?.data);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all expenses
export const getAllExpenses = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const response = await api.get(`/?${params.toString()}`);
  return response.data;
};

// Get expense by ID
export const getExpenseById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// Create expense
export const createExpense = async (expenseData) => {
  console.log('📤 Creating expense:', expenseData);
  const response = await api.post('/', expenseData);
  console.log('✅ Expense created:', response.data);
  return response.data;
};

// Update expense
export const updateExpense = async (id, expenseData) => {
  console.log('📤 Updating expense:', id, expenseData);
  const response = await api.put(`/${id}`, expenseData);
  console.log('✅ Expense updated:', response.data);
  return response.data;
};

// Delete expense
export const deleteExpense = async (id) => {
  console.log('📤 Deleting expense:', id);
  const response = await api.delete(`/${id}`);
  console.log('✅ Expense deleted:', response.data);
  return response.data;
};

// Get expense stats
export const getExpenseStats = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const response = await api.get(`/stats?${params.toString()}`);
  return response.data;
};

// Get daily total
export const getDailyTotal = async (date) => {
  const response = await api.get(`/daily-total?date=${date}`);
  return response.data;
};


