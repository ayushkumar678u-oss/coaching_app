const BASE_URL = import.meta.env.VITE_API_URL || '';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${BASE_URL}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }

  return response.json();
};

export default apiFetch;