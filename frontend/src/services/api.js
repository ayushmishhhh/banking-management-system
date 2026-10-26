import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bob_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to unwrap data and handle error messages uniformly
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const customersApi = {
  getAll: (search = '') => api.get(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const accountsApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.type) searchParams.append('type', params.type);
    if (params.branchId) searchParams.append('branchId', params.branchId);
    if (params.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    return api.get(`/accounts${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/accounts/${id}`),
  getByNumber: (number) => api.get(`/accounts/by-number/${number}`),
  getByCustomer: (customerId) => api.get(`/accounts/by-customer/${customerId}`),
  create: (data) => api.post('/accounts', data),
  updateStatus: (id, status) => api.patch(`/accounts/${id}/status`, { status }),
};

export const transactionsApi = {
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.accountId) searchParams.append('accountId', params.accountId);
    if (params.type) searchParams.append('type', params.type);
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    const query = searchParams.toString();
    return api.get(`/transactions${query ? `?${query}` : ''}`);
  },
  getByAccount: (accountId) => api.get(`/transactions/account/${accountId}`),
};

export const branchesApi = {
  getAll: () => api.get('/branches'),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
};

export const loansApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.loanType) searchParams.append('loanType', params.loanType);
    if (params.branchId) searchParams.append('branchId', params.branchId);
    const query = searchParams.toString();
    return api.get(`/loans${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/loans/${id}`),
  apply: (data) => api.post('/loans/apply', data),
  approve: (id) => api.patch(`/loans/${id}/approve`),
  reject: (id) => api.patch(`/loans/${id}/reject`),
  repay: (id, amount) => api.post(`/loans/${id}/repay`, { amount }),
};

export const reportsApi = {
  getStatement: (accountId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get(`/reports/statement/${accountId}${query ? `?${query}` : ''}`);
  },
  getBranchPerformance: () => api.get('/reports/branch-performance'),
  getHighValueTransactions: (threshold = 50000) => api.get(`/reports/high-value-transactions?threshold=${threshold}`),
  getLoanPortfolio: () => api.get('/reports/loan-portfolio'),
};

export const databaseInfoApi = {
  getSchema: () => api.get('/database-info/schema'),
  executeDemoQuery: (key) => api.get(`/database-info/demo-query?key=${key}`),
};

export default api;
