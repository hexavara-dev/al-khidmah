import api from './api';

const multipartConfig = { headers: { 'Content-Type': undefined } };

export const campaignService = {
    getAll:  (params)     => api.get('/campaigns', { params }),
    // POST with FormData — let browser set multipart/form-data boundary
    create:  (data)       => api.post('/campaigns', data, multipartConfig),
    // PUT can't carry files; send POST + _method:PUT (caller appends _method)
    update:  (id, data)   => api.post(`/campaigns/${id}`, data, multipartConfig),
    destroy: (id)         => api.delete(`/campaigns/${id}`),
};
