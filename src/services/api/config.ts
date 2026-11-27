import { API_ORIGIN } from '../../config/apiOrigin';
// API Configuration
// StarPower Admin API — production gateway mounts dashboard at /api/dashboard/api
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_DASHBOARD_API ??
    `${API_ORIGIN}/api/dashboard/api`,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const PRODUCT = 'starpower' as const;

// API Endpoints
export const API_ENDPOINTS = {
  // User Data APIs
  USER_DATA: {
    GET_ALL_USERS: '/userdata/getallusers',
    GET_ALL_LISTENERS: '/userdata/getalllisteners',
    GET_STATS: '/userdata/stats',
    GET_BY_ID: '/userdata/:id',
  },
  
  // User Update APIs
  USER_UPDATE: {
    UPDATE_BY_ID: '/user-update/update-user-by-id/:userId',
    UPDATE_BY_PHONE: '/user-update/update-user-by-phone/:phoneNumber',
    UPDATE_FIELD_BY_ID: '/user-update/update-user-field-by-id/:userId/:field',
    UPDATE_FIELD_BY_PHONE: '/user-update/update-user-field-by-phone/:phoneNumber/:field',
    BULK_UPDATE: '/user-update/bulk-update-users',
    UPDATE_STATUS: '/user-update/update-user-status/:userId',
    UPDATE_LISTENER_STATUS: '/user-update/update-listener-status/:userId',
    UPDATE_CATEGORY: '/user-update/update-user-category/:userId',
    UPDATE_STATE: '/user-update/update-user-state/:userId',
    UPDATE_PROFILE_PHOTO: '/user-update/update-user-profile-photo/:userId',
    UPDATE_EMAIL: '/user-update/update-user-email/:userId',
    UPDATE_MOBILE: '/user-update/update-user-mobile/:userId',
    UPDATE_FULL_NAME: '/user-update/update-user-full-name/:userId',
    UPDATE_USERNAME: '/user-update/update-user-username/:userId',
    UPDATE_BIO: '/user-update/update-user-bio/:userId',
    UPDATE_AGE: '/user-update/update-user-age/:userId',
    UPDATE_GENDER: '/user-update/update-user-gender/:userId',
    UPDATE_PROFESSION: '/user-update/update-user-profession/:userId',
    UPDATE_QUALIFICATION: '/user-update/update-user-qualification/:userId',
    UPDATE_EXPERIENCE: '/user-update/update-user-experience/:userId',
    UPDATE_SPECIALIZATION: '/user-update/update-user-specialization/:userId',
    UPDATE_CONSULTATION_FEE: '/user-update/update-user-consultation-fee/:userId',
    UPDATE_PER_MINUTE_COST: '/user-update/update-user-per-minute-cost/:userId',
    UPDATE_CHAT_PER_MINUTE_COST: '/user-update/update-user-chat-per-minute-cost/:userId',
    UPDATE_COMMISSION_PER: '/user-update/update-user-commission-per/:userId',
    UPDATE_CHAT_COMMISSION_PER: '/user-update/update-user-chat-commission-per/:userId',
    UPDATE_KYC_STATUS: '/user-update/update-user-kyc-status/:userId',
    UPDATE_DOCTOR_PROFILE_STATUS: '/user-update/update-user-doctor-profile-status/:userId',
    UPDATE_AUDIT_LOG: '/user-update/update-user-audit-log/:userId',
  },
  
  // Session APIs
  SESSIONS: {
    GET_ALL: '/sessions/allsessions',
    GET_MISSED: '/sessions/missed',
    GET_BY_USER: '/sessions/user/:userId',
    GET_BY_LISTENER: '/sessions/listener/:listenerId',
    GET_BY_DATE: '/sessions/bydate',
    GET_USER_BY_DATE: '/sessions/user/:userId/bydate',
    GET_LISTENER_BY_DATE: '/sessions/listener/:listenerId/bydate',
    GET_ACTIVE: '/sessions/active',
    GET_COMPLETED: '/sessions/completed',
    GET_CANCELLED: '/sessions/cancelled',
    GET_STATS: '/sessions/stats',
    GET_DETAILS: '/sessions/details/:sessionId',
    GET_BY_ID: '/sessions/:sessionId',
  },
  
  // Wallet APIs
  WALLET: {
    GET_TRANSACTIONS: '/astro/wallet/transactions',
    GET_USER_TRANSACTIONS: '/astro/wallet/transactions/user/:userId',
    GET_TRANSACTIONS_BY_DATE: '/astro/wallet/transactions/date-range',
    GET_USER_TRANSACTIONS_BY_DATE: '/astro/wallet/transactions/user/:userId/date-range',
    GET_TRANSACTIONS_BY_TYPE: '/astro/wallet/transactions/type/:type',
    GET_USER_TRANSACTIONS_BY_TYPE: '/astro/wallet/transactions/user/:userId/type/:type',
    GET_TRANSACTIONS_BY_REMARK: '/astro/wallet/transactions/remark/:remark',
    GET_USER_TRANSACTIONS_BY_REMARK: '/astro/wallet/transactions/user/:userId/remark/:remark',
    GET_TRANSACTION_BY_ORDER: '/astro/wallet/transactions/order/:orderId',
    GET_TRANSACTION_BY_CLIENT_REF: '/astro/wallet/transactions/client-ref/:clientRefId',
    GET_ADMIN_PAID: '/astro/wallet/transactions/admin-paid',
    GET_RECENT_USER: '/astro/wallet/transactions/recent/user/:userId',
    GET_ALL: '/astro/wallet/transactions/all',
    GET_BALANCE_USER: '/astro/wallet/balance/user/:userId',
    GET_BALANCE_TOTAL: '/astro/wallet/balance/total',
    GET_STATISTICS: '/astro/wallet/statistics',
    GET_USER_STATISTICS: '/astro/wallet/statistics/user/:userId',
    GET_OVERALL_STATISTICS: '/astro/wallet/statistics/overall',
  },
  
  // Doctor Availability APIs
  DOCTOR_AVAILABILITY: {
    // Status Management
    UPDATE_STATUS_BY_USER_ID: '/doctor-availability/doctor/:userId/status',
    UPDATE_STATUS_BY_PHONE: '/doctor-availability/doctor/phone/:phoneNumber/status',
    GET_STATUS_BY_USER_ID: '/doctor-availability/doctor/:userId/status',
    GET_STATUS_BY_PHONE: '/doctor-availability/doctor/phone/:phoneNumber/status',
    
    // History
    GET_HISTORY_BY_USER_ID: '/doctor-availability/doctor/:userId/history',
    GET_HISTORY_BY_PHONE: '/doctor-availability/doctor/phone/:phoneNumber/history',
    
    // Doctor Lists
    GET_DOCTORS_BY_STATUS: '/doctor-availability/doctors/status/:status',
    GET_AVAILABLE_DOCTORS: '/doctor-availability/doctors/available',
    GET_UNAVAILABLE_DOCTORS: '/doctor-availability/doctors/unavailable',
    
    // Statistics
    GET_STATISTICS: '/doctor-availability/statistics',
    
    // Bulk Operations
    BULK_UPDATE_STATUS: '/doctor-availability/doctors/bulk-status',
    
    // Record Management
    GET_STATUS_BY_ID: '/doctor-availability/status/:statusId',
    DELETE_STATUS_BY_ID: '/doctor-availability/status/:statusId',
  },
  
  // Activity APIs
  ACTIVITY: {
    GET_LATEST: '/activity/latest',
    GET_BY_USER: '/activity/user/:userId',
    GET_BY_USER_PHONE: '/activity/user/phone/:phoneNumber',
    GET_BY_TYPE: '/activity/type/:type',
    GET_BY_USER_AND_TYPE: '/activity/user/:userId/type/:type',
    GET_BY_USER_PHONE_AND_TYPE: '/activity/user/phone/:phoneNumber/type/:type',
    GET_STATISTICS: '/activity/statistics',
    GET_USER_STATISTICS: '/activity/statistics/user/:userId',
    GET_USER_PHONE_STATISTICS: '/activity/statistics/user/phone/:phoneNumber',
    GET_BY_DATE_RANGE: '/activity/date-range',
    GET_USER_BY_DATE_RANGE: '/activity/user/:userId/date-range',
    GET_USER_PHONE_BY_DATE_RANGE: '/activity/user/phone/:phoneNumber/date-range',
    GET_BY_ID: '/activity/:activityId',
    CREATE: '/activity/',
    UPDATE: '/activity/:activityId/update',
    DELETE: '/activity/:activityId/delete',
  },
  
  // Posts APIs
  POSTS: {
    GET_ALL: '/posts/',
    GET_BY_USER: '/posts/user/:userId',
    GET_BY_CATEGORY: '/posts/category/:categoryId',
    GET_STATISTICS: '/posts/statistics',
    GET_BY_ID: '/posts/:postId',
    DELETE_COMMENT: '/posts/:postId/comments/:commentId',
  },
  
  // Notifications APIs
  NOTIFICATIONS: {
    GET_ALL: '/notifications/',
    GET_BY_USER: '/notifications/user/:userId',
    GET_STATISTICS: '/notifications/statistics',
    GET_FCM_STATISTICS: '/notifications/fcm-statistics',
    SEND: '/notifications/send',
    SCHEDULE: '/notifications/schedule',
    SEND_GLOBAL: '/notifications/send-global',
  },
  
  // Analytics APIs
  ANALYTICS: {
    GET_DASHBOARD: '/analytics/dashboard',
    GET_USERS: '/analytics/users',
    GET_FINANCIAL: '/analytics/financial',
    GET_GROWTH: '/analytics/growth',
  },

  // App config APIs
  APP_CONFIG: {
    USER: '/app/user-app-config',
    PARTNER: '/app/partner-app-config',
  },

  // Booking coupons APIs
  BOOKING_COUPONS: {
    LIST: '/booking-coupons',
    BY_CODE: '/booking-coupons/:code',
    ENABLED: '/booking-coupons/:code/enabled',
  },

  RAZORPAY_TEST_USERS: {
    LIST: '/razorpay/test-users',
    BY_USER_ID: '/razorpay/test-users/:userId',
  },
};

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchParams {
  search?: string;
  status?: string | number;
  type?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
