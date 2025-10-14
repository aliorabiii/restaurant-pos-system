import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Products API
export const productAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },
  
  getByCategory: async (category) => {
    const response = await axios.get(`${API_URL}/products/category/${category}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  }
};

// Orders API
export const orderAPI = {
  create: async (orderData) => {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  },
  
  getAll: async () => {
    const response = await axios.get(`${API_URL}/orders`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  },
  
  getToday: async () => {
    const response = await axios.get(`${API_URL}/orders/today`);
    return response.data;
  }
};