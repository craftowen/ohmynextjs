export const routes = {
  home: '/',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    verifyEmail: '/auth/verify-email',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: '/dashboard',
  admin: {
    root: '/admin',
    users: '/admin/users',
    userDetail: (id: string) => `/admin/users/${id}` as const,
    payments: '/admin/payments',
    settings: '/admin/settings',
    legal: '/admin/legal',
    legalNew: '/admin/legal/new',
    auditLogs: '/admin/audit-logs',
  },
  legal: {
    terms: '/terms',
    privacy: '/privacy',
  },
  api: {
    health: '/api/health',
    authCallback: '/api/auth/callback',
    authConfirm: '/api/auth/confirm',
  },
} as const;
