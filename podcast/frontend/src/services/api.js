const BACKEND_URL = 'http://localhost:5001';

export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

export const getAudioUrl = (audioPath) => {
  if (!audioPath) return '';
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
    return audioPath;
  }
  return `${BACKEND_URL}${audioPath.startsWith('/') ? '' : '/'}${audioPath}`;
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BACKEND_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const authAPI = {
  register: ({ name, email, password }) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name?.trim(),
        email: email?.trim().toLowerCase(),
        password
      })
    }),

  login: ({ email, password }) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim().toLowerCase(),
        password
      })
    })
};

export const episodesAPI = {
  getAll: () => request('/api/episodes'),

  search: (query) => request(`/api/episodes/search?q=${encodeURIComponent(query)}`),

  getById: (id) => request(`/api/episodes/${id}`),

  create: (data) =>
    request('/api/episodes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    request(`/api/episodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id) =>
    request(`/api/episodes/${id}`, {
      method: 'DELETE'
    }),

  uploadAudio: (id, file) => {
    const formData = new FormData();
    formData.append('audio', file);
    return request(`/api/episodes/${id}/audio`, {
      method: 'POST',
      body: formData
    });
  }
};

export const subscriptionsAPI = {
  subscribe: (episodeId) =>
    request('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ episodeId })
    }),

  unsubscribe: (subscriptionId) =>
    request(`/api/subscriptions/${subscriptionId}`, {
      method: 'DELETE'
    })
};

export const reviewsAPI = {
  getAll: () => request('/api/reviews'),

  getByEpisode: (episodeId) => request(`/api/reviews/episode/${episodeId}`),

  create: ({ episodeId, rating, comment }) =>
    request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ episodeId, rating: Number(rating), comment })
    })
};

export const analyticsAPI = {
  getOverall: () => request('/api/analytics'),

  getEpisodeAnalytics: (episodeId) => request(`/api/analytics/episode/${episodeId}`)
};
