/**
 * Game Flow Service
 * Manages the overall game flow and state transitions according to backend API
 */

import unifiedWebSocketService from './unifiedWebSocketService.js';
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
        console.log('🎮 [GAME_START_DEBUG] === STARTING GAME DEBUG ===');
        console.log('🎮 [GAME_START_DEBUG] hostUserId:', hostUserId);
        console.log('🎮 [GAME_START_DEBUG] options:', options);
        console.log('🎮 [GAME_START_DEBUG] this.isHost:', this.isHost);
        console.log('🎮 [GAME_START_DEBUG] this.currentRoom:', this.currentRoom);
        console.log('🎮 [GAME_START_DEBUG] WebSocket connected:', unifiedWebSocketService.isConnected());
        console.log('🎮 [GAME_START_DEBUG] Current timestamp:', new Date().toISOString());

        // Skip host check if explicitly requested or if we're in a special case
        if (!options.skipHostCheck && !this.isHost) {
            console.log('🎮 [GAME_START_DEBUG] Host check needed - checking localStorage...');
            
            // Try to re-determine host status from localStorage
            const currentRoom = JSON.parse(localStorage.getItem('currentRoom') || '{}');
            const currentUserId = localStorage.getItem('userId');
            
            console.log('🎮 [GAME_START_DEBUG] localStorage currentRoom:', currentRoom);
            console.log('🎮 [GAME_START_DEBUG] localStorage currentUserId:', currentUserId);
            
            if (currentRoom.isHost === true || currentRoom.hostId === currentUserId) {
                console.log('🎮 [GAME_START_DEBUG] ✅ Host status confirmed from localStorage');
                this.isHost = true;
            } else {
                console.log('🎮 [GAME_START_DEBUG] ❌ Host validation failed');
                throw new Error('Only host can start the game');
            }
        }

        if (!this.currentRoom) {
            console.log('🎮 [GAME_START_DEBUG] ❌ No room initialized');
            throw new Error('No room initialized');
        }

        try {
            console.log('🎮 [GAME_START_DEBUG] 📤 Preparing to call backend startGame API...');

            const gameStartData = {
                roomCode: this.currentRoom,
                hostUserId: hostUserId,
                selectedTopicIds: options.selectedTopicIds,
                questionCount: options.questionCount || 10,
                timeLimit: options.timeLimit || 30
            };

            console.log('🎮 [GAME_START_DEBUG] gameStartData:', gameStartData);

            console.log('🎮 [GAME_START_DEBUG] 📤 Sending API request to backend...');
            const result = await startGame(gameStartData);
            console.log('🎮 [GAME_START_DEBUG] 📥 Backend response received:', result);
            console.log('🎮 [GAME_START_DEBUG] Response status:', result.status);
            console.log('🎮 [GAME_START_DEBUG] Response data:', result.data);

            if (result.status === 200) {
                console.log('🎮 [GAME_START_DEBUG] ✅ Game started successfully');
                
                this.currentGameState = 'starting';
                console.log('🎮 [GAME_START_DEBUG] State changed to: starting');
                
                // Emit local event for immediate UI feedback
                console.log('🎮 [GAME_START_DEBUG] 📢 Emitting game-flow-state-changed event...');
                eventEmitter.emit('game-flow-state-changed', {
                    state: 'starting',
                    data: result.data
                });

                console.log('🎮 [GAME_START_DEBUG] 📢 Waiting for GAME_STARTED WebSocket event...');
                console.log('🎮 [GAME_START_DEBUG] Backend should now send GAME_STARTED to all players in room:', this.currentRoom);
                // The backend will send GAME_STARTED WebSocket event to all players
                return result;
            } else {
                console.log('🎮 [GAME_START_DEBUG] ❌ Backend returned error:', result.message);
                throw new Error(result.message || 'Failed to start game');
            }
        } catch (error) {
            console.log('🎮 [GAME_START_DEBUG] ❌ Exception occurred:', error);
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
        console.log('🎮 [GAME_START_DIRECT] === DIRECT GAME START DEBUG ===');
        console.log('🎮 [GAME_START_DIRECT] roomCode:', roomCode);
        console.log('🎮 [GAME_START_DIRECT] hostUserId:', hostUserId);
        console.log('🎮 [GAME_START_DIRECT] options:', options);

        // Set room and host status directly
        this.currentRoom = roomCode;
        this.isHost = true; // Override for direct start
        console.log('🎮 [GAME_START_DIRECT] Set room and host status');

        try {
            const gameStartData = {
                roomCode: roomCode,
                hostUserId: hostUserId,
                selectedTopicIds: options.selectedTopicIds,
                questionCount: options.questionCount || 10,
                timeLimit: options.timeLimit || 30
            };

            console.log('🎮 [GAME_START_DIRECT] 📤 Calling backend with:', gameStartData);

            const result = await startGame(gameStartData);
            console.log('🎮 [GAME_START_DIRECT] 📥 Backend response:', result);

            if (result.status === 200) {
                console.log('🎮 [GAME_START_DIRECT] ✅ Game started successfully');
                
                this.currentGameState = 'starting';
                console.log('🎮 [GAME_START_DIRECT] State changed to: starting');
                
                eventEmitter.emit('game-flow-state-changed', {
                    state: 'starting',
                    data: result.data
                });

                console.log('🎮 [GAME_START_DIRECT] 📢 Waiting for GAME_STARTED WebSocket event...');
                return result;
            } else {
                console.log('🎮 [GAME_START_DIRECT] ❌ Backend returned error:', result.message);
                throw new Error(result.message || 'Failed to start game');
            }
        } catch (error) {
            console.log('🎮 [GAME_START_DIRECT] ❌ Exception occurred:', error);
            throw error;
        }
    }
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
        console.log('🎮 [WS_SETUP] Setting up WebSocket event listeners for game flow');
        console.log('🎮 [WS_SETUP] Current timestamp:', new Date().toISOString());

        // Game started event - Backend sends GAME_STARTED
        unifiedWebSocketService.on('GAME_STARTED', (data) => {
            console.log('🎮 [WS_EVENT] === GAME_STARTED EVENT RECEIVED ===');
            console.log('🎮 [WS_EVENT] Timestamp:', new Date().toISOString());
            console.log('🎮 [WS_EVENT] GAME_STARTED data:', data);
            console.log('🎮 [WS_EVENT] Current user ID:', localStorage.getItem('userId'));
            console.log('🎮 [WS_EVENT] Current room:', this.currentRoom);
            console.log('🎮 [WS_EVENT] Is host:', this.isHost);
            console.log('🎮 [WS_EVENT] Current user should navigate to game page');
            
            this.currentGameState = 'started';
            console.log('🎮 [WS_EVENT] State updated to: started');
            
            console.log('🎮 [WS_EVENT] 📢 Emitting game-flow-state-changed...');
            eventEmitter.emit('game-flow-state-changed', {
                state: 'started',
                data
            });
            
            console.log('🎮 [WS_EVENT] 📢 Emitting game-flow-game-started...');
            eventEmitter.emit('game-flow-game-started', data);
            
            console.log('🎮 [WS_EVENT] Events emitted, UI should update now');
        });

        // Question sent event - Backend sends QUESTION_SENT  
        unifiedWebSocketService.on('QUESTION_SENT', (data) => {
            console.log('🎮 [WS_EVENT] === QUESTION_SENT EVENT RECEIVED ===');
            console.log('🎮 [WS_EVENT] Timestamp:', new Date().toISOString());
            console.log('🎮 [WS_EVENT] QUESTION_SENT data:', data);
            console.log('🎮 [WS_EVENT] Current room:', this.currentRoom);
            
            this.currentGameState = 'playing';
            console.log('🎮 [WS_EVENT] State updated to: playing');
            
            eventEmitter.emit('game-flow-state-changed', {
                state: 'playing',
                data
            });
            eventEmitter.emit('game-flow-question', data);
            console.log('🎮 [WS_EVENT] Question events emitted');
        });

        // Game finished event - Backend sends GAME_FINISHED
        unifiedWebSocketService.on('GAME_FINISHED', (data) => {
            console.log('🎮 [WS_EVENT] GAME_FINISHED received:', data);
            
            this.currentGameState = 'finished';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'finished',
                data
            });
            eventEmitter.emit('game-flow-game-finished', data);
        });

        // Legacy event handlers for backward compatibility
        unifiedWebSocketService.on('game-started', (data) => {
            console.log('🎮 [WS_EVENT] === LEGACY game-started EVENT RECEIVED ===');
            console.log('🎮 [WS_EVENT] Timestamp:', new Date().toISOString());
            console.log('🎮 [WS_EVENT] Legacy game-started data:', data);
            console.log('🎮 [WS_EVENT] Calling handleGameStarted...');
            this.handleGameStarted(data);
        });

        unifiedWebSocketService.on('countdown', (data) => {
            console.log('🎮 [WS_EVENT] === COUNTDOWN EVENT RECEIVED ===');
            console.log('🎮 [WS_EVENT] Timestamp:', new Date().toISOString());
            console.log('🎮 [WS_EVENT] Countdown data:', data);
            console.log('🎮 [WS_EVENT] Current room:', this.currentRoom);
            console.log('🎮 [WS_EVENT] Emitting game-flow-countdown...');
            eventEmitter.emit('game-flow-countdown', data);
        });

        unifiedWebSocketService.on('question', (data) => {
            console.log('🎮 [WS_EVENT] Question event:', data);
            this.currentGameState = 'playing';
            eventEmitter.emit('game-flow-state-changed', {
                state: 'playing',
                data
            });
            eventEmitter.emit('game-flow-question', data);
        });

        unifiedWebSocketService.on('game-ended', (data) => {
            console.log('🎮 [WS_EVENT] Game ended event:', data);
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
        console.log('🎮 [NAVIGATION] === HANDLE GAME STARTED ===');
        console.log('🎮 [NAVIGATION] Game started data:', data);
        console.log('🎮 [NAVIGATION] Current user ID:', localStorage.getItem('userId'));
        console.log('🎮 [NAVIGATION] Is host:', this.isHost);
        
        this.currentGameState = 'started';
        eventEmitter.emit('game-flow-state-changed', {
            state: 'started',
            data
        });
        
        // Navigate to game page
        if (typeof window !== 'undefined' && window.location) {
            const roomCode = data.roomCode || this.currentRoom;
            console.log('🎮 [NAVIGATION] 🚀 Navigating to game page for room:', roomCode);
            console.log('🎮 [NAVIGATION] Target URL: /game/' + roomCode);
            
            // Set flag to indicate game navigation
            localStorage.setItem('gameNavigating', 'true');
            localStorage.setItem('gameRoomCode', roomCode);
            
            window.location.href = `/game/${roomCode}`;
        } else {
            console.log('🎮 [NAVIGATION] ❌ Cannot navigate - window or location not available');
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
