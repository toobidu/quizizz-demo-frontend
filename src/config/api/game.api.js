import apiInstance from './apiInstance';
import { API_ENDPOINTS } from '../../constants/api';

/**
 * Game API Service
 * Handles all game-related API calls according to backend specification
 */

/**
 * Start a game for a specific room
 * @param {Object} data - Game start data
 * @param {string} data.roomCode - Room code
 * @param {number} data.hostUserId - Host user ID
 * @param {number[]} data.selectedTopicIds - Array of selected topic IDs (optional)
 * @param {number} data.questionCount - Number of questions (optional, default 10)
 * @param {number} data.timeLimit - Time limit per question in seconds (optional, default 30)
 * @returns {Promise<Object>} - API response
 */
export const startGame = async (data) => {
    try {
        // Add default values according to backend documentation
        const gameStartData = {
            roomCode: data.roomCode,
            hostUserId: data.hostUserId,
            selectedTopicIds: data.selectedTopicIds,
            questionCount: data.questionCount || 10,
            timeLimit: data.timeLimit || 30
        };

        const response = await apiInstance.post('/game/start', gameStartData);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Get current game status for a room
 * @param {string} roomCode - Room code
 * @returns {Promise<Object>} - Game status
 */
export const getGameStatus = async (roomCode) => {
    try {
        const response = await apiInstance.get(`/game/status/${roomCode}`);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Get game results
 * @param {string} roomCode - Room code
 * @returns {Promise<Object>} - Game results
 */
export const getGameResults = async (roomCode) => {
    try {
        const response = await apiInstance.get(`/game/results/${roomCode}`);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Submit answer for a question via WebSocket
 * @param {Object} data - Answer data
 * @param {number} data.questionId - Question ID
 * @param {number} data.selectedOptionId - Selected option ID
 * @param {number} data.timeToAnswer - Time taken to answer in seconds
 * @param {string} data.roomCode - Room code
 * @returns {Promise<Object>} - Submit result
 */
export const submitAnswer = async (data) => {
    try {
        // Format answer data according to backend documentation
        const answerData = {
            questionId: data.questionId,
            selectedOptionId: data.selectedOptionId,
            timeToAnswer: data.timeToAnswer,
            roomCode: data.roomCode
        };

        const response = await apiInstance.post('/game/answer', answerData);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Get questions for a game session
 * @param {string} roomCode - Room code
 * @returns {Promise<Object>} - Questions data
 */
export const getGameQuestions = async (roomCode) => {
    try {
        const response = await apiInstance.get(`/game/questions/${roomCode}`);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * End a game session
 * @param {Object} data - End game data
 * @param {string} data.roomCode - Room code
 * @param {number} data.hostUserId - Host user ID
 * @returns {Promise<Object>} - End result
 */
export const endGame = async (data) => {
    try {
        const response = await apiInstance.post('/game/end', data);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Get player statistics for a game
 * @param {string} roomCode - Room code
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Player statistics
 */
export const getPlayerStats = async (roomCode, userId) => {
    try {
        const response = await apiInstance.get(`/game/stats/${roomCode}/${userId}`);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Create a new game session
 * @param {Object} data - Game session data
 * @param {number} data.roomId - Room ID
 * @param {string} data.gameState - Initial game state (default: "waiting")
 * @param {number} data.currentQuestionIndex - Current question index (default: 0)
 * @param {number} data.timeLimit - Time limit per question (default: 30)
 * @returns {Promise<Object>} - Game session data
 */
export const createGameSession = async (data) => {
    try {
        const sessionData = {
            roomId: data.roomId,
            gameState: data.gameState || 'waiting',
            currentQuestionIndex: data.currentQuestionIndex || 0,
            timeLimit: data.timeLimit || 30
        };

        const response = await apiInstance.post('/game-sessions', sessionData);
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
export const getGameSessionByRoom = async (roomId) => {
    try {
        const response = await apiInstance.get(`/game-sessions/by-room?roomId=${roomId}`);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Add questions to game session
 * @param {Object} data - Questions data
 * @param {number} data.gameSessionId - Game session ID
 * @param {number[]} data.questionIds - Array of question IDs
 * @param {number} data.timeLimit - Time limit per question
 * @returns {Promise<Object>} - Response data
 */
export const addQuestionsToSession = async (gameSessionId, data) => {
    try {
        const response = await apiInstance.post(`/game-sessions/questions?gameSessionId=${gameSessionId}`, data);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Get questions for a game session
 * @param {number} gameSessionId - Game session ID
 * @returns {Promise<Object>} - Questions data
 */
export const getGameSessionQuestions = async (gameSessionId) => {
    try {
        const response = await apiInstance.get(`/game-sessions/questions?gameSessionId=${gameSessionId}`);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};

/**
 * Send question to players
 * @param {Object} data - Question data
 * @param {string} data.roomCode - Room code
 * @param {Object} data.question - Question object with id, text, options
 * @param {number} data.questionIndex - Current question index
 * @param {number} data.totalQuestions - Total number of questions
 * @returns {Promise<Object>} - Response data
 */
export const sendQuestion = async (data) => {
    try {
        const response = await apiInstance.post('/game/question', data);
        return response.data;
    } catch (error) {
        
        throw error.response?.data || error;
    }
};
