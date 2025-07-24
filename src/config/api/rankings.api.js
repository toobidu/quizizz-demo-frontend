import apiInstance from './apiInstance';

/**
 * Rankings API Service
 * Handles all ranking-related API calls
 */

/**
 * Get global rankings
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.level - Difficulty level filter (optional)
 * @returns {Promise<Object>} - Global rankings data
 */
export const getGlobalRankings = async (params = {}) => {
    try {
        const { page = 1, limit = 10, level } = params;
        
        let url = `/rankings/global?page=${page}&limit=${limit}`;
        if (level) {
            url += `&level=${level}`;
        }

        const response = await apiInstance.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get room rankings
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} - Room rankings data
 */
export const getRoomRankings = async (roomId) => {
    try {
        const response = await apiInstance.get(`/rankings/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get user's ranking position
 * @param {number} userId - User ID
 * @param {string} level - Difficulty level (optional)
 * @returns {Promise<Object>} - User ranking data
 */
export const getUserRanking = async (userId, level = null) => {
    try {
        let url = `/rankings/user/${userId}`;
        if (level) {
            url += `?level=${level}`;
        }

        const response = await apiInstance.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get leaderboard for a specific game session
 * @param {number} sessionId - Game session ID
 * @returns {Promise<Object>} - Session leaderboard
 */
export const getSessionLeaderboard = async (sessionId) => {
    try {
        const response = await apiInstance.get(`/rankings/session/${sessionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get top performers by topic
 * @param {number} topicId - Topic ID
 * @param {number} limit - Number of top performers to get (default: 10)
 * @returns {Promise<Object>} - Top performers data
 */
export const getTopPerformersByTopic = async (topicId, limit = 10) => {
    try {
        const response = await apiInstance.get(`/rankings/topic/${topicId}?limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
