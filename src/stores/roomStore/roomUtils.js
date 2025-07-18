/**
 * Utility functions for room store
 */
const roomUtils = (set, get) => ({
  // Get current user ID from token
  getCurrentUserId: () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[DEBUG USERID] Token payload:', payload);
        const userId = payload.userId || payload.sub || payload.id || payload.Id;
        console.log('[DEBUG USERID] Extracted userId:', userId);
        return userId;
      }
    } catch (error) {
      console.error('[USER ID] Lỗi lấy ID người dùng:', error);
    }
    return null;
  },

  // Get current username from token
  getCurrentUsername: () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[DEBUG USERNAME] Token payload:', payload);
        const username = payload.username || payload.name || payload.Username || payload.Name;
        console.log('[DEBUG USERNAME] Extracted username:', username);
        return username;
      }
    } catch (error) {
      console.error('[USERNAME] Lỗi lấy username:', error);
    }
    return null;
  }
});

export default roomUtils;