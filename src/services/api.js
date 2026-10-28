// API client for SmartLearn MySQL backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  return `${backendBase}${url}`;
};

export const getToken = () => localStorage.getItem('smartlearn_token');
export const setToken = (token) => localStorage.setItem('smartlearn_token', token);
export const removeToken = () => localStorage.removeItem('smartlearn_token');

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data?.message;
    if (!errorMsg) {
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        errorMsg = 'Backend server connection failed. Please ensure MySQL (XAMPP) and the backend server are running.';
      } else {
        errorMsg = `Request failed with status ${response.status}`;
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authAPI = {
  login: (email, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, role = 'student') =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getMe: () => request('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export const notesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.subject) searchParams.append('subject', params.subject);
    if (params.search) searchParams.append('search', params.search);
    if (params.teacherId) searchParams.append('teacherId', params.teacherId);
    const qs = searchParams.toString();
    return request(`/notes${qs ? `?${qs}` : ''}`);
  },

  create: (formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request('/notes', {
      method: 'POST',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },

  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

export const quizzesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.mine) searchParams.append('mine', 'true');
    const qs = searchParams.toString();
    return request(`/quizzes${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => request(`/quizzes/${id}`),

  create: (quizData) =>
    request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  delete: (id) => request(`/quizzes/${id}`, { method: 'DELETE' }),

  submit: (id, answers) =>
    request(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getAttempts: (id) => request(`/quizzes/${id}/attempts`),

  getMyAttempts: () => request('/quizzes/student/my-attempts'),
};

export const adminAPI = {
  getOverview: () => request('/admin/overview'),
  getUsers: (role) => request(`/admin/users${role ? `?role=${role}` : ''}`),
  createTeacher: (data) =>
    request('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  importStudentsExcel: (formData) =>
    request('/admin/students/import-excel', {
      method: 'POST',
      body: formData,
    }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getSubmissions: () => request('/admin/submissions'),
};
