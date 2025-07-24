/**
 * User Identity Utilities
 * 
 * This file contains utilities for managing user identity consistently
 * across the application, ensuring we use userId and not socket.id.
 */

/**
 * Gets the current user's ID from localStorage or JWT token
 * @returns {string} The user ID
 */
export const getUserId = () => {
  // First try to get from localStorage
  let userId = localStorage.getItem('userId');
  
  // If not found, try to extract from JWT token
  if (!userId) {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.sub || payload.id;
        
        // Save to localStorage for future use
        if (userId) {
          localStorage.setItem('userId', userId);
        }
      }
    } catch (error) {
      
    }
  }
  
  return userId;
};

/**
 * Normalizes a user object to ensure consistent property names
 * @param {Object} user - The user object to normalize
 * @returns {Object} Normalized user object
 */
export const normalizeUser = (user) => {
  if (!user) return null;
  
  return {
    userId: user.userId || user.userId || user.id || user.Id,
    username: user.username || user.username || user.name || user.Name || 'Unknown',
    isHost: user.isHost || user.isHost || false,
    isReady: user.isReady || user.isReady || false,
    joinTime: user.joinTime || user.joinTime || new Date().toISOString()
  };
};

/**
 * Normalizes an array of users
 * @param {Array} users - Array of user objects
 * @returns {Array} Array of normalized user objects
 */
export const normalizeUsers = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map(normalizeUser).filter(Boolean);
};

export default {
  getUserId,
  normalizeUser,
  normalizeUsers
};