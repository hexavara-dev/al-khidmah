import api from './api';

export const donationService = {
    create: (data) => api.post('/donations', data),
    confirmPayment: (id, paymentData = {}) => api.post(`/donations/${id}/confirm-payment`, paymentData),
    checkPayment: (id) => api.post(`/donations/${id}/check-payment`),
    myDonations: (params) => api.get('/my-donations', { params }),
    forCampaign: (campaignId) => api.get(`/campaigns/${campaignId}/donors`),
    getAll: (params) => api.get('/donations', { params }),
    updateStatus: (id, status) => api.put(`/donations/${id}/status`, { status }),
};
