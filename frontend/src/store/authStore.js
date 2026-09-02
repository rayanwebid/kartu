import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,

    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        set({ user: response.data.user, token: response.data.token });
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null });
        }
    }
}));
