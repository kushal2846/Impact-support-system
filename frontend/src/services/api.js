import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

export const api = {
    getDashboardStats: () => axios.get(`${API_URL}/dashboard`).then(res => res.data),
    getActiveImpacts: () => axios.get(`${API_URL}/active-impacts`).then(res => res.data),
    getTickets: (limit) => axios.get(`${API_URL}/tickets?limit=${limit || 50}`).then(res => res.data),
    getTicket: (id) => axios.get(`${API_URL}/tickets/${id}`).then(res => res.data),
    createTicket: (data) => axios.post(`${API_URL}/tickets`, data),
    getServices: () => axios.get(`${API_URL}/services`).then(res => res.data),
    
    // New Features
    searchDeflection: (q) => axios.get(`${API_URL}/search-deflection?q=${q}`).then(res => res.data),
    getActivityLog: () => axios.get(`${API_URL}/activity-log`).then(res => res.data),
};
