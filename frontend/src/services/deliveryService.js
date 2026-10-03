import { apiRequest } from './api';

export const deliveryService = {
  getAll(status = '') {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/api/deliveries${qs}`);
  },

  getById(id) {
    return apiRequest(`/api/deliveries/${id}`);
  },

  create(deliveryData) {
    return apiRequest('/api/deliveries', {
      method: 'POST',
      body: JSON.stringify(deliveryData)
    });
  },

  update(id, deliveryData) {
    return apiRequest(`/api/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deliveryData)
    });
  },

  delete(id) {
    return apiRequest(`/api/deliveries/${id}`, {
      method: 'DELETE'
    });
  }
};
