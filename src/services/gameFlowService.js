/**
 * Game Flow Service
 * Manages the overall game flow and state transitions according to backend API
 */

import unifiedWebSocketService from './unifiedWebSocketService.js';
import { ensureWebSocketConnection } from './websocketUtils.js';
import { 
    getGameStatus, 
    getGameResults, 
    submitAnswer as submitAnswerAPI,
    createGameSession,
    getGameSessionByRoom,
    addQuestionsToSession 
} from '../config/api/game.api';
import eventEmitter from './eventEmitter';

class GameFlowService {
    constructor() {
        this.currentGameState = 'idle'; // idle, lobby, countdown, playing, ended
        this.currentRoom = null;
        this.isHost = false;
        this.setupEventListeners();
    }

    /**
     * Initialize game for a room
     * @param {string} roomCode - Room code
     * @param {boolean} isHost - Whether current user is host
     */
    async initializeGame(roomCode, isHost) {
        this.currentRoom = roomCode;
        this.isHost = isHost;
        this.currentGameState = 'lobby';

        // Connect to WebSocket if not connected
        if (!unifiedWebSocketService.isConnected()) {
            await unifiedWebSocketService.connect();
        }

    }

    /**
     * Start game (host only) - Updated according to backend API documentation
     * @param {number} hostUserId - Host user ID
     * @param {Object} options - Additional options
     * @param {number[]} options.selectedTopicIds - Selected topic IDs (optional)
     * @param {number} options.questionCount - Number of questions (optional, default 10)
     * @param {number} options.timeLimit - Time limit per question (optional, default 30)
     * @param {boolean} options.skipHostCheck - Skip host validation (for testing or special cases)
     */
    async startGameAsHost(hostUserId, options = {}) {
        // Skip host check if explicitly requested or if we're in a special case
        if (!options.skipHostCheck && !this.isHost) {
            // Try to re-determine host status from localStorage
            const currentRoom = JSON.parse(localStorage.getItem('currentRoom') || '{}');
            const currentUserId = localStorage.getItem('userId');
            if (currentRoom.isHost === true || currentRoom.hostId === currentUserId) {
                this.isHost = true;
            } else {
                throw new Error('Only host can start the game');
            }
        }

        if (!this.currentRoom) {
            throw new Error('No room initialized');
        }

        try {
            // Đảm bảo WebSocket connection trước khi gửi event
            const isConnected = await ensureWebSocketConnection();
            if (!isConnected) {
                throw new Error('WebSocket connection failed');
            }

            const gameStartData = {
                roomCode: this.currentRoom,
                hostUserId: hostUserId,
                selectedTopicIds: options.selectedTopicIds,
                questionCount: options.questionCount || 10,
                timeLimit: options.timeLimit || 30
            };

            // Gửi qua WebSocket thay vì REST API
            const result = await unifiedWebSocketService.sendSafely('start-game', gameStartData, 10000);
            this.currentGameState = 'starting';
            // Emit local event for immediate UI feedback
            eventEmitter.emit('game-flow-state-changed', {
                state: 'starting',
                data: result
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Start game without host validation (for direct calls from UI)
     * @param {string} roomCode - Room code
     * @param {number} hostUserId - Host user ID  
     * @param {Object} options - Game options
     */
    async startGameDirect(roomCode, hostUserId, options = {}) {
        // Set room and host status directly
        this.currentRoom = roomCode;
        this.isHost = true; // Override for direct start
        try {
            const gameStartData = {
                roomCode: roomCode,
                hostUserId: hostUserId,
                selectedTopicIds: options.selectedTopicIds,
                questionCount: options.questionCount || 10,
                timeLimit: options.timeLimit || 30
            };
            // Sử dụng WebSocket thay vì REST API
            const result = await unifiedWebSocketService.sendSafely('start-game', gameStartData, 10000);
            this.currentGameState = 'starting';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'starting',
                data: result.data || gameStartData
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Submit answer for current question
     */
    async submitAnswer(questionId, selectedOptionId, timeToAnswer) {
        if (!this.currentRoom) {
            throw new Error('No room initialized');
        }

        try {
            // Submit via WebSocket for real-time response (primary method)
            unifiedWebSocketService.send('submit_answer', { 
                questionId: questionId, 
                selectedOptionId, 
                timeToAnswer, 
                roomCode: this.currentRoom 
            });

        } catch (error) {
            throw error;
        }
    }

    /**
     * Get current game status
     */
    async getGameStatus() {
        if (!this.currentRoom) {
            throw new Error('No room initialized');
        }

        try {
            const status = await getGameStatus(this.currentRoom);
            return status;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get game results
     */
    async getResults() {
        if (!this.currentRoom) {
            throw new Error('No room initialized');
        }

        try {
            const results = await getGameResults(this.currentRoom);
            return results;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Leave game and cleanup
     */
    leaveGame() {
        this.currentGameState = 'idle';
        this.currentRoom = null;
        this.isHost = false;

        // Disconnect from WebSocket
        unifiedWebSocketService.disconnect();
    }

    /**
     * Setup WebSocket event listeners for game flow - Updated for backend API
     */
    setupEventListeners() {
        // Game started event - Listen for multiple event formats
        unifiedWebSocketService.on('GAME_STARTED', (data) => {
            this.handleGameStartedEvent(data);
        });
        unifiedWebSocketService.on('game-started', (data) => {
            this.handleGameStartedEvent(data);
        });
        // Question sent event - Listen for multiple event formats
        unifiedWebSocketService.on('QUESTION_SENT', (data) => {
            this.handleQuestionSentEvent(data);
        });
        unifiedWebSocketService.on('question', (data) => {
            this.handleQuestionSentEvent(data);
        });
        unifiedWebSocketService.on('question-sent', (data) => {
            this.handleQuestionSentEvent(data);
        });
        // Game finished event - Backend sends GAME_FINISHED
        unifiedWebSocketService.on('GAME_FINISHED', (data) => {
            this.currentGameState = 'finished';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'finished',
                data
            });
            eventEmitter.emit('game-flow-game-finished', data);
        });
        // Legacy event handlers for backward compatibility
        unifiedWebSocketService.on('game-started', (data) => {
            this.handleGameStarted(data);
        });
        unifiedWebSocketService.on('countdown', (data) => {
            eventEmitter.emit('game-flow-countdown', data);
        });
        unifiedWebSocketService.on('question', (data) => {
            this.currentGameState = 'playing';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'playing',
                data
            });
            eventEmitter.emit('game-flow-question', data);
        });
        unifiedWebSocketService.on('game-ended', (data) => {
            this.currentGameState = 'ended';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'ended',
                data
            });
            eventEmitter.emit('game-flow-game-ended', data);
        });
    }

    /**
     * Handle game started event and navigate to game page
     * @param {Object} data - Game started data
     */
    handleGameStarted(data) {
        this.currentGameState = 'started';
        eventEmitter.emit('game-flow-state-changed', {
            state: 'started',
            data
        });
        // Navigate to game page
        if (typeof window !== 'undefined' && window.location) {
            const roomCode = data.roomCode || this.currentRoom;
            // Set flag to indicate game navigation
            localStorage.setItem('gameNavigating', 'true');
            localStorage.setItem('gameRoomCode', roomCode);
            window.location.href = `/game/${roomCode}`;
        }
    }

    /**
     * Get current game state
     */
    getCurrentState() {
        return {
            state: this.currentGameState,
            room: this.currentRoom,
            isHost: this.isHost
        };
    }

    /**
     * Check if user is host
     */
    isCurrentUserHost() {
        return this.isHost;
    }

    /**
     * Handle game started event unified
     */
    handleGameStartedEvent(data) {
        this.currentGameState = 'started';
        eventEmitter.emit('game-flow-state-changed', {
            state: 'started',
            data
        });
        eventEmitter.emit('game-flow-game-started', data);
    }

    /**
     * Handle question sent event unified
     */
    handleQuestionSentEvent(data) {
        this.currentGameState = 'playing';
        eventEmitter.emit('game-flow-state-changed', {
            state: 'playing',
            data
        });
        eventEmitter.emit('game-flow-question', data);
    }

    /**
     * Get current room code
     */
    getCurrentRoom() {
        return this.currentRoom;
    }
}

// Export singleton instance
const gameFlowService = new GameFlowService();
export default gameFlowService;
