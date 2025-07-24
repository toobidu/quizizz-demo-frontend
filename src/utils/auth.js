/**
 * Authentication Utilities
 * 
 * Helper functions for authentication and token management
 */

/**
 * Extract user ID from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null if extraction fails
 */
export const getUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch (error) {
    
    return null;
  }
};

/**
 * Get current user ID from stored token
 * @returns {string|null} Current user ID or null
 */
export const getCurrentUserId = () => {
  const token = localStorage.getItem('accessToken');
  return getUserIdFromToken(token);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
};