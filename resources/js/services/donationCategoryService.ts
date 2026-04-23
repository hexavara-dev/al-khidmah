import api from './api';

export const donationCategoryService = {
    getAll:  (params?: Record<string, unknown>)          => api.get('/categories', { params }),
    create:  (data: Record<string, unknown>)             => api.post('/categories', data),
    update:  (id: number, data: Record<string, unknown>) => api.put(`/categories/${id}`, data),
    destroy: (id: number)                                => api.delete(`/categories/${id}`),
};
