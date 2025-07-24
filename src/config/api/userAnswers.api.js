import apiInstance from './apiInstance';

/**
 * User Answers API Service
 * Handles all user answer-related API calls
 */

/**
 * Submit user answer
 * @param {Object} data - Answer data
 * @param {number} data.questionId - Question ID
 * @param {number} data.selectedAnswerId - Selected answer ID
 * @param {number} data.timeTaken - Time taken to answer (in seconds)
 * @param {number} data.gameSessionId - Game session ID (optional)
 * @returns {Promise<Object>} - Submit result
 */
export const submitUserAnswer = async (data) => {
    try {
        const answerData = {
            questionId: data.questionId,
            selectedAnswerId: data.selectedAnswerId,
            timeTaken: data.timeTaken,
            gameSessionId: data.gameSessionId
        };

        const response = await apiInstance.post('/user-answers/submit', answerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get user answers for a specific session
 * @param {number} userId - User ID
 * @param {number} sessionId - Game session ID
 * @returns {Promise<Object>} - User answers data
 */
export const getUserAnswersInSession = async (userId, sessionId) => {
    try {
        const response = await apiInstance.get(`/user-answers/user/${userId}/session/${sessionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get session statistics (all answers)
 * @param {number} sessionId - Game session ID
 * @returns {Promise<Object>} - Session statistics
 */
export const getSessionStatistics = async (sessionId) => {
    try {
        const response = await apiInstance.get(`/user-answers/session/${sessionId}/statistics`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Bulk submit answers (for offline support)
 * @param {Array} answers - Array of answer objects
 * @returns {Promise<Object>} - Bulk submit result
 */
export const bulkSubmitAnswers = async (answers) => {
    try {
        const response = await apiInstance.post('/user-answers/bulk-submit', { answers });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get user's performance across all sessions
 * @param {number} userId - User ID
 * @param {number} limit - Number of recent sessions to include
 * @returns {Promise<Object>} - User performance data
 */
export const getUserPerformance = async (userId, limit = 10) => {
    try {
        const response = await apiInstance.get(`/user-answers/user/${userId}/performance?limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
