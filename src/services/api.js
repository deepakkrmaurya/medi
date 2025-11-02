import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instances
export const authAPI = axios.create({
  baseURL: BASE_URL + '/auth',
});

export const medicinesAPI = axios.create({
  baseURL: BASE_URL + '/medicines',
});

export const billsAPI = axios.create({
  baseURL: BASE_URL + '/bills',
});

export const reportsAPI = axios.create({
  baseURL: BASE_URL + '/reports',
});

// Request interceptor to add token
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor to handle errors
const handleResponseError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    toast.error('Session expired. Please login again.');
  }
  return Promise.reject(error);
};

// Add interceptors to all API instances
[medicinesAPI, billsAPI, reportsAPI].forEach(api => {
  api.interceptors.request.use(addAuthToken);
  api.interceptors.response.use(
    response => response,
    handleResponseError
  );
});

// Medicine API methods
export const medicineAPI = {
  getAll: (params) => medicinesAPI.get('/', { params }),
  getById: (id) => medicinesAPI.get(`/${id}`),
  create: (data) => medicinesAPI.post('/', data),
  update: (id, data) => medicinesAPI.put(`/${id}`, data),
  delete: (id) => medicinesAPI.delete(`/${id}`),
  getExpiry: (type) => medicinesAPI.get('/expiry', { params: { type } }),
  getStats: () => medicinesAPI.get('/dashboard/stats')
};

// Bill API methods
export const billAPI = {
  getAll: (params) => billsAPI.get('/', { params }),
  getById: (id) => billsAPI.get(`/${id}`),
  create: (data) => billsAPI.post('/', data),
  update: (id, data) => billsAPI.put(`/${id}`, data),
  delete: (id) => billsAPI.delete(`/${id}`),
  getSalesStats: () => billsAPI.get('/stats/sales'),
  generatePDF: (id) => billsAPI.get(`/${id}/pdf`, { responseType: 'blob' })
};

// Report API methods
export const reportAPI = {
  getSalesReport: (params) => reportsAPI.get('/sales', { params }),
  getInventoryReport: (params) => reportsAPI.get('/inventory', { params }),
  getExpiryReport: (params) => reportsAPI.get('/expiry', { params }),
  exportMedicines: () => reportsAPI.get('/export/medicines', { responseType: 'blob' }),
  exportSales: (params) => reportsAPI.get('/export/sales', { 
    params,
    responseType: 'blob' 
  })
};