import { apiRequest } from './api';

export const tripService = {
  getAll() {
    return apiRequest('/api/trips');
  },

  getById(id) {
    return apiRequest(`/api/trips/${id}`);
  },

  create(tripData) {
    return apiRequest('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  },

  update(id, tripData) {
    return apiRequest(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData)
    });
  },

  delete(id) {
    return apiRequest(`/api/trips/${id}`, {
      method: 'DELETE'
    });
  }
};
