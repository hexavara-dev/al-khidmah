import api from './api';

export const campaignService = {
    getAll: (params) => api.get('/campaigns', { params }),
    getById: (id) => api.get(`/campaigns/${id}`),
    create: (data) => api.post('/campaigns', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.post(`/campaigns/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/campaigns/${id}`),
};
