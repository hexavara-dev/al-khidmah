import api from './api';

export const campaignService = {
    getAll:  (params)          => api.get('/campaigns', { params }),
    create:  (data)            => api.post('/campaigns', data),
    update:  (id, data)        => api.put(`/campaigns/${id}`, data),
    destroy: (id)              => api.delete(`/campaigns/${id}`),
};
