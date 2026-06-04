import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'menu',
    component: () => import('../views/MenuView.vue')
  },
  {
    path: '/admin',
    name: 'admin-login',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminDashboard.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminOrders.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const loggedIn = sessionStorage.getItem('ribuluo_admin_auth')
    if (!loggedIn) return '/admin'
  }
})

export default router
