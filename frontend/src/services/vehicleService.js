import { apiRequest } from './api';

export const vehicleService = {
  getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.vehicleType) query.append('vehicleType', params.vehicleType);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return apiRequest(`/api/vehicles${qs ? `?${qs}` : ''}`);
  },

  getById(id) {
    return apiRequest(`/api/vehicles/${id}`);
  },

  create(vehicleData) {
    return apiRequest('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },

  update(id, vehicleData) {
    return apiRequest(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  },

  delete(id) {
    return apiRequest(`/api/vehicles/${id}`, {
      method: 'DELETE'
    });
  }
};
