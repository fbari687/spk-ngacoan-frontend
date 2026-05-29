import { defineStore } from 'pinia';
import api from '../axios';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isOwner = computed(() => user.value?.role === 'owner');

  // Actions
  const login = async (credentials) => {
    try {
      const browserData = navigator.userAgent.split(' ')[0];
      const finalDeviceName = `${browserData}_${Date.now()}`;

      const payload = {
        ...credentials,
        device_name: finalDeviceName,
      };

      const response = await api.post('/login', payload);

      token.value = response.data.data.token;
      user.value = response.data.data.user;

      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));
    } catch (error) {
      throw error;
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // 4. Return semua variabel dan fungsi agar bisa dipakai di komponen Vue
  return {
    user,
    token,
    isAuthenticated,
    isOwner,
    login,
    logout
  };
})
