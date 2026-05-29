import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth';

const routes = [
  // ==========================================
  // 1. RUTE PUBLIK (TIDAK PAKAI MAIN LAYOUT)
  // ==========================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guestOnly: true }
  },

  // ==========================================
  // 2. RUTE INTERNAL (DIBUNGKUS MAIN LAYOUT)
  // ==========================================
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'), // <-- Induk Layout
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Path kosong berarti ini default saat user membuka '/'
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
      },
      {
        path: 'criteria',
        name: 'Criteria',
        component: () => import('../views/CriteriaView.vue'),
      },
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('../views/SuppliersView.vue'),
      },
      {
        path: 'evaluations',
        name: 'Evaluations',
        component: () => import('../views/EvaluationsView.vue'),
      },
      {
        path: 'rankings',
        name: 'Rankings',
        component: () => import('../views/RankingsView.vue'),
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('../views/HistoryView.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue'),
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  } else if (to.meta.guestOnly && isAuthenticated) {
    return next('/');
  }

  next();
})

export default router
