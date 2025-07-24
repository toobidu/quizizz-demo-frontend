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
                // Updated to include UserId for compatibility with capital U
                const userId = payload.userId || payload.sub || payload.id || payload.Id;
                return userId;
            }
        } catch (error) {
            
        }
        return null;
    },

    // Get current username from token
    getCurrentUsername: () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const username = payload.username || payload.name || payload.Name;
                return username;
            }
        } catch (error) {
            
        }
        return null;
    }
});

export default roomUtils;
