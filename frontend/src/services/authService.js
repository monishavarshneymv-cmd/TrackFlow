import { apiRequest } from './api';

export const authService = {
  async login(username, password) {
    const token = btoa(`${username}:${password}`);
    // Temporarily save to verify login against backend /api/auth/me
    sessionStorage.setItem('trackflow_auth', token);

    try {
      const user = await apiRequest('/api/auth/me');
      sessionStorage.setItem('trackflow_user', JSON.stringify(user));
      return user;
    } catch (err) {
      sessionStorage.removeItem('trackflow_auth');
      sessionStorage.removeItem('trackflow_user');
      throw err;
    }
  },

  logout() {
    sessionStorage.removeItem('trackflow_auth');
    sessionStorage.removeItem('trackflow_user');
  },

  getCurrentUser() {
    const raw = sessionStorage.getItem('trackflow_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(sessionStorage.getItem('trackflow_auth'));
  }
};
