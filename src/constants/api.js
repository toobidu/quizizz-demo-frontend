/**
 * API Configuration Constants
 * 
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 10000,
  WEBSOCKET_URL: 'ws://localhost:3001'
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/forgot-password/send-otp',
    VERIFY_OTP: '/forgot-password/verify-otp',
    RESET_PASSWORD: '/forgot-password/reset'
  },
  
  // Rooms
  ROOMS: {
    ALL: '/rooms/all',
    PUBLIC: '/rooms/public',
    CREATE: '/rooms/create',
    BY_CODE: (code) => `/rooms/code/${code}`,
    JOIN: (code) => `/rooms/${code}/join`,
    LEAVE: (code) => `/rooms/${code}/leave`,
    DELETE: (code) => `/rooms/${code}`,
    PLAYERS: (id) => `/rooms/${id}/players`,
    DETAILS: (id) => `/rooms/${id}/details`,
    MY_CURRENT: '/rooms/my-current'
  },
  
  // Profile
  PROFILE: {
    ME: '/profile/me',
    UPDATE: '/profile/update',
    PASSWORD: '/profile/password',
    SEARCH: (username) => `/profile/search/${username}`
  },
  
  // Topics
  TOPICS: {
    ALL: '/topics/all'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};