// Central API Client for TrackFlow
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getAuthHeader() {
  const auth = sessionStorage.getItem('trackflow_auth');
  if (!auth) return {};
  return {
    Authorization: `Basic ${auth}`
  };
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred.';
    if (data && data.message) {
      errorMessage = data.message;
    } else if (response.status === 401) {
      errorMessage = 'Invalid username or password.';
    } else if (response.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (response.status === 404) {
      errorMessage = 'Requested resource not found.';
    } else if (response.status === 409) {
      errorMessage = 'A conflict occurred. Record already exists.';
    } else if (response.status >= 500) {
      errorMessage = 'Internal server error. Please try again later.';
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
