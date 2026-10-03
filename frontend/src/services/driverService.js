import { apiRequest } from './api';

export const driverService = {
  getAll(search = '') {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/api/drivers${qs}`);
  },

  getById(id) {
    return apiRequest(`/api/drivers/${id}`);
  },

  create(driverData) {
    return apiRequest('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },

  update(id, driverData) {
    return apiRequest(`/api/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },

  delete(id) {
    return apiRequest(`/api/drivers/${id}`, {
      method: 'DELETE'
    });
  }
};
