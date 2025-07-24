import apiInstance from './apiInstance';

/**
 * Game Sessions API Service
 * Handles all game session-related API calls
 */

/**
 * Get game session by ID
 * @param {number} id - Game session ID
 * @returns {Promise<Object>} - Game session data
 */
export const getGameSession = async (id) => {
    try {
        const response = await apiInstance.get(`/game-sessions/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get game session by room ID
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} - Game session data
 */
export const getGameSessionByRoomId = async (roomId) => {
    try {
        const response = await apiInstance.get(`/game-sessions/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Create a new game session
 * @param {Object} data - Game session data
 * @param {number} data.roomId - Room ID
 * @param {number} data.hostId - Host user ID
 * @param {string} data.gameState - Initial game state ('waiting', 'playing', 'finished')
 * @param {number} data.currentQuestionIndex - Current question index
 * @param {number} data.totalQuestions - Total number of questions
 * @param {number} data.timePerQuestion - Time per question in seconds
 * @returns {Promise<Object>} - Created game session
 */
export const createGameSession = async (data) => {
    try {
        const sessionData = {
            roomId: data.roomId,
            hostId: data.hostId,
            gameState: data.gameState || 'waiting',
            currentQuestionIndex: data.currentQuestionIndex || 0,
            totalQuestions: data.totalQuestions || 10,
            timePerQuestion: data.timePerQuestion || 30
        };

        const response = await apiInstance.post('/game-sessions', sessionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Update game session
 * @param {number} id - Game session ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated game session
 */
export const updateGameSession = async (id, data) => {
    try {
        const response = await apiInstance.put(`/game-sessions/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Delete game session
 * @param {number} id - Game session ID
 * @returns {Promise<Object>} - Delete result
 */
export const deleteGameSession = async (id) => {
    try {
        const response = await apiInstance.delete(`/game-sessions/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Update game session state
 * @param {number} id - Game session ID
 * @param {Object} data - State update data
 * @param {string} data.gameState - New game state
 * @param {number} data.currentQuestionIndex - Current question index
 * @returns {Promise<Object>} - Updated game session
 */
export const updateGameSessionState = async (id, data) => {
    try {
        const response = await apiInstance.put(`/game-sessions/${id}/state`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
