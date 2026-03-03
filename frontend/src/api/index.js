import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
export const jobsApi = {
  getAll: (params) => axios.get('/api/jobs', { params }),
  getOne: (id) => axios.get(`/api/jobs/${id}`),
  getStats: () => axios.get('/api/jobs/stats'),
  create: (data) => axios.post('/api/jobs', data),
  update: (id, data) => axios.put(`/api/jobs/${id}`, data),
  remove: (id) => axios.delete(`/api/jobs/${id}`),
  addNote: (id, content) => axios.post(`/api/jobs/${id}/notes`, { content }),
  deleteNote: (jobId, noteId) => axios.delete(`/api/jobs/${jobId}/notes/${noteId}`),
};

export const authApi = {
  login: (data) => axios.post('/api/auth/login', data),
  register: (data) => axios.post('/api/auth/register', data),
};

// Status config
export const STATUS_CONFIG = {
  applied:     { label: 'Applied',      color: '#60a5fa', bg: '#60a5fa22' },
  interview:   { label: 'Interview',    color: '#f5a623', bg: '#f5a62322' },
  offer:       { label: 'Offer',        color: '#4ade80', bg: '#4ade8022' },
  rejected:    { label: 'Rejected',     color: '#f87171', bg: '#f8717122' },
  no_response: { label: 'No Response',  color: '#6b6b82', bg: '#6b6b8222' },
  withdrawn:   { label: 'Withdrawn',    color: '#a78bfa', bg: '#a78bfa22' },
};

export const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#f87171' },
  medium: { label: 'Medium', color: '#f5a623' },
  low:    { label: 'Low',    color: '#6b6b82' },
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};
