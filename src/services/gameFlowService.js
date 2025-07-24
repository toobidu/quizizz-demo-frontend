/**
 * Game Flow Service
 * Manages the overall game flow and state transitions according to backend API
 */

import websocketService from './websocketService';
import { 
    startGame, 
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
        if (!websocketService.isConnected()) {
            await websocketService.connect();
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

            const gameStartData = {
                roomCode: this.currentRoom,
                hostUserId: hostUserId,
                selectedTopicIds: options.selectedTopicIds || [1, 2, 3], // Default math, history, geography
                questionCount: options.questionCount || 10,
                timeLimit: options.timeLimit || 30
            };

            const result = await startGame(gameStartData);

            if (result.status === 200) {
                
                this.currentGameState = 'starting';
                
                // Emit local event for immediate UI feedback
                eventEmitter.emit('game-flow-state-changed', {
                    state: 'starting',
                    data: result.data
                });

                // The backend will send GAME_STARTED WebSocket event to all players
                return result;
            } else {
                throw new Error(result.message || 'Failed to start game');
            }
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
                selectedTopicIds: options.selectedTopicIds || [1, 2, 3],
                questionCount: options.questionCount || 10,
                timeLimit: options.timeLimit || 30
            };

            const result = await startGame(gameStartData);

            if (result.status === 200) {
                
                this.currentGameState = 'starting';
                
                eventEmitter.emit('game-flow-state-changed', {
                    state: 'starting',
                    data: result.data
                });

                return result;
            } else {
                throw new Error(result.message || 'Failed to start game');
            }
        } catch (error) {
            
            throw error;
        }
    }
    async submitAnswer(questionId, selectedOptionId, timeToAnswer) {
        if (!this.currentRoom) {
            throw new Error('No room initialized');
        }

        try {
            // Submit via WebSocket for real-time response (primary method)
            websocketService.submitAnswerBackend(questionId, selectedOptionId, timeToAnswer, this.currentRoom);

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
        websocketService.disconnect();

    }

    /**
     * Setup WebSocket event listeners for game flow - Updated for backend API
     */
    setupEventListeners() {
        // Game started event - Backend sends GAME_STARTED
        websocketService.on('GAME_STARTED', (data) => {
            
            this.currentGameState = 'started';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'started',
                data
            });
            eventEmitter.emit('game-flow-game-started', data);
        });

        // Question sent event - Backend sends QUESTION_SENT  
        websocketService.on('QUESTION_SENT', (data) => {
            
            this.currentGameState = 'playing';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'playing',
                data
            });
            eventEmitter.emit('game-flow-question', data);
        });

        // Answer result event - Backend sends ANSWER_RESULT
        websocketService.on('ANSWER_RESULT', (data) => {
            
            eventEmitter.emit('game-flow-answer-result', data);
        });

        // Game progress event - Backend sends GAME_PROGRESS
        websocketService.on('GAME_PROGRESS', (data) => {
            
            eventEmitter.emit('game-flow-game-progress', data);
        });

        // Scoreboard update event - Backend sends SCOREBOARD_UPDATE
        websocketService.on('SCOREBOARD_UPDATE', (data) => {
            
            eventEmitter.emit('game-flow-scoreboard-update', data);
        });

        // Game finished event - Backend sends GAME_FINISHED
        websocketService.on('GAME_FINISHED', (data) => {
            
            this.currentGameState = 'finished';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'finished',
                data
            });
            eventEmitter.emit('game-flow-game-finished', data);
        });

        // Legacy event handlers for backward compatibility
        websocketService.on('game-started', (data) => {
            
            this.handleGameStarted(data);
        });

        websocketService.on('countdown', (data) => {
            
            eventEmitter.emit('game-flow-countdown', data);
        });

        websocketService.on('question', (data) => {
            
            this.currentGameState = 'playing';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'playing',
                data
            });
            eventEmitter.emit('game-flow-question', data);
        });

        websocketService.on('answer-result', (data) => {
            
            eventEmitter.emit('game-flow-answer-result', data);
        });

        websocketService.on('game-ended', (data) => {
            
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
     * Get current room code
     */
    getCurrentRoom() {
        return this.currentRoom;
    }
}

// Export singleton instance
const gameFlowService = new GameFlowService();
export default gameFlowService;
