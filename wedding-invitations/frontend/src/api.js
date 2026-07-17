import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

export const getTemplates = () => API.get('/templates');
export const getTemplate = (id) => API.get(`/templates/${id}`);

export const getMyInvitations = () => API.get('/invitations');
export const getAllInvitations = () => API.get('/invitations/all');
export const getPublicInvitation = (slug) => API.get(`/invitations/public/${slug}`);
export const createInvitation = (data) => API.post('/invitations', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateInvitation = (id, data) => API.put(`/invitations/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteInvitation = (id) => API.delete(`/invitations/${id}`);
export const publishInvitation = (id, publish) => API.patch(`/invitations/${id}/publish`, { publish });
export const resetAllMusic = () => API.patch('/invitations/reset-music');
export const submitRsvp = (id, data) => API.post(`/invitations/${id}/rsvp`, data);

export const getAdminUsers = () => API.get('/admin/users');
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminStats = () => API.get('/admin/stats');

export default API;
