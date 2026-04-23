import api from './api';

const downloadBlob = (data, filename) => {
    const url  = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const reportService = {
    downloadCampaignPdf: async (params = {}) => {
        const res = await api.get('/reports/campaigns', { params, responseType: 'blob' });
        downloadBlob(res.data, `laporan-campaign-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
    downloadDonationPdf: async (params = {}) => {
        const res = await api.get('/reports/donations', { params, responseType: 'blob' });
        downloadBlob(res.data, `laporan-donasi-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
};
