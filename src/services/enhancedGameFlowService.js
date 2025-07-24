/**
 * Enhanced Game Flow Service
 * Manages complete game flow with new backend APIs and realtime features
 */

import unifiedWebSocketService from './unifiedWebSocketService.js';
import eventEmitter from './eventEmitter';

// API imports
import { startGame, getGameStatus, getGameResults } from '../config/api/game.api';
import { 
    createGameSession, 
    getGameSessionByRoomId, 
    updateGameSessionState 
} from '../config/api/gameSessions.api';
import { 
    getRandomQuestionsFromTopics, 
    getQuestionWithAnswers 
} from '../config/api/questions.api';
import { 
    submitUserAnswer, 
    getUserAnswersInSession, 
    getSessionStatistics 
} from '../config/api/userAnswers.api';
import { 
    getRoomRankings, 
    getSessionLeaderboard 
} from '../config/api/rankings.api';

class EnhancedGameFlowService {
    constructor() {
        this.currentGameState = 'idle'; // idle, lobby, countdown, playing, ended
        this.currentRoom = null;
        this.currentSession = null;
        this.isHost = false;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.playerScores = new Map();
        this.gameTimer = null;
        
        this.setupEventListeners();
    }

    /**
     * Initialize game for a room
     */
    async initializeGame(roomCode, isHost, userId) {
        this.currentRoom = roomCode;
        this.isHost = isHost;
        this.currentUserId = userId;
        this.currentGameState = 'lobby';

        // Connect to WebSocket if not connected
        if (!unifiedWebSocketService.isConnected()) {
            await unifiedWebSocketService.connect();
        }

        // Try to get existing game session
        try {
            const roomId = await this.getRoomIdFromCode(roomCode);
            const existingSession = await getGameSessionByRoomId(roomId);
            if (existingSession) {
                this.currentSession = existingSession;
                this.currentGameState = existingSession.gameState;
            }
        } catch (error) {
        }
    }

    /**
     * Start game as host with enhanced features
     */
    async startGameAsHost(hostUserId, options = {}) {
        if (!this.isHost) {
            throw new Error('Only host can start the game');
        }

        try {
            // Get room ID
            const roomId = await this.getRoomIdFromCode(this.currentRoom);

            // Create game session
            const sessionData = {
                roomId,
                hostId: hostUserId,
                gameState: 'waiting',
                currentQuestionIndex: 0,
                totalQuestions: options.questionCount || 10,
                timePerQuestion: options.timeLimit || 30
            };

            this.currentSession = await createGameSession(sessionData);

            // Get questions for the game
            const topicIds = options.selectedTopicIds;
            if (!topicIds || topicIds.length === 0) {
                throw new Error('No topics selected for the game');
            }
            const questionsResponse = await getRandomQuestionsFromTopics(
                sessionData.totalQuestions, 
                topicIds
            );
            this.questions = questionsResponse.questions || [];

            // Start the game via backend API
            const gameStartData = {
                roomCode: this.currentRoom,
                hostUserId,
                selectedTopicIds: topicIds,
                questionCount: sessionData.totalQuestions,
                timeLimit: sessionData.timePerQuestion
            };

            const result = await startGame(gameStartData);

            if (result.status === 200) {
                this.currentGameState = 'preparing';
                
                // Update session state to preparing first
                await updateGameSessionState(this.currentSession.id, {
                    gameState: 'preparing',
                    currentQuestionIndex: 0
                });

                // Emit preparing state
                eventEmitter.emit('enhanced-game-flow-state-changed', {
                    state: 'preparing',
                    data: result.data,
                    session: this.currentSession
                });

                // Start synchronized countdown after 2 seconds
                setTimeout(() => {
                    this.startSynchronizedCountdown();
                }, 2000);

                return result;
            } else {
                throw new Error(result.message || 'Failed to start game');
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Submit answer with enhanced tracking
     */
    async submitAnswer(questionId, selectedAnswerId, timeTaken) {
        if (!this.currentRoom || !this.currentSession) {
            throw new Error('No active game session');
        }

        try {
            // Submit via WebSocket for real-time response
            unifiedWebSocketService.send('submit_answer', {
                questionId,
                selectedAnswerId: selectedAnswerId,
                timeToAnswer: timeTaken,
                roomCode: this.currentRoom,
                gameSessionId: this.currentSession.id
            });

            // Also submit via HTTP API as backup
            const answerData = {
                questionId,
                selectedAnswerId,
                timeTaken,
                gameSessionId: this.currentSession.id
            };

            const result = await submitUserAnswer(answerData);
            
            // Store answer locally
            this.userAnswers.push({
                questionId,
                selectedAnswerId,
                timeTaken,
                submittedAt: new Date().toISOString(),
                isCorrect: result.isCorrect,
                pointsEarned: result.pointsEarned
            });

            // Emit local event
            eventEmitter.emit('enhanced-answer-submitted', {
                questionId,
                selectedAnswerId,
                timeTaken,
                result
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get current game status with enhanced data
     */
    async getEnhancedGameStatus() {
        if (!this.currentRoom || !this.currentSession) {
            return null;
        }

        try {
            // Get basic game status
            const gameStatus = await getGameStatus(this.currentRoom);
            
            // Get session statistics
            const sessionStats = await getSessionStatistics(this.currentSession.id);
            
            // Get current leaderboard
            const leaderboard = await getSessionLeaderboard(this.currentSession.id);

            return {
                gameStatus,
                sessionStats,
                leaderboard,
                currentSession: this.currentSession,
                currentQuestionIndex: this.currentQuestionIndex,
                totalQuestions: this.questions.length,
                userAnswers: this.userAnswers
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handle game events with enhanced processing
     */
    setupEventListeners() {
        // Enhanced game countdown event - ALL players including host
        unifiedWebSocketService.on('game-countdown', (data) => {
            this.currentGameState = 'countdown';
            
            eventEmitter.emit('enhanced-game-flow-countdown', {
                countdownValue: data.countdownValue || data.value || 3,
                totalCountdown: data.totalCountdown || 3,
                data,
                session: this.currentSession
            });
        });

        // Enhanced game started event
        unifiedWebSocketService.on('GAME_STARTED', (data) => {
            this.currentGameState = 'started';
            
            eventEmitter.emit('enhanced-game-flow-state-changed', {
                state: 'started',
                data,
                session: this.currentSession
            });
        });

        // Enhanced question event
        unifiedWebSocketService.on('QUESTION_SENT', (data) => {
            this.currentGameState = 'playing';
            this.currentQuestionIndex = data.questionNumber - 1;
            
            eventEmitter.emit('enhanced-game-flow-question', {
                question: data.question,
                questionIndex: this.currentQuestionIndex,
                totalQuestions: this.questions.length,
                session: this.currentSession
            });
        });

        // Enhanced answer result event
        unifiedWebSocketService.on('ANSWER_RESULT', (data) => {
            
            eventEmitter.emit('enhanced-game-flow-answer-result', {
                ...data,
                session: this.currentSession
            });
        });

        // Enhanced scoreboard update
        unifiedWebSocketService.on('SCOREBOARD_UPDATE', (data) => {
            
            // Update local scores
            if (data.scoreboard) {
                data.scoreboard.forEach(player => {
                    this.playerScores.set(player.userId, player);
                });
            }
            
            eventEmitter.emit('enhanced-game-flow-scoreboard-update', {
                scoreboard: data.scoreboard,
                session: this.currentSession
            });
        });

        // Enhanced game end event
        unifiedWebSocketService.on('GAME_FINISHED', async (data) => {
            this.currentGameState = 'finished';
            
            // Get final statistics
            try {
                const finalStats = await getSessionStatistics(this.currentSession.id);
                const finalLeaderboard = await getSessionLeaderboard(this.currentSession.id);
                
                eventEmitter.emit('enhanced-game-flow-game-finished', {
                    ...data,
                    finalStats,
                    finalLeaderboard,
                    session: this.currentSession,
                    userAnswers: this.userAnswers
                });
            } catch (error) {
                eventEmitter.emit('enhanced-game-flow-game-finished', {
                    ...data,
                    session: this.currentSession,
                    userAnswers: this.userAnswers
                });
            }
        });

        // Game progress tracking
        unifiedWebSocketService.on('GAME_PROGRESS', (data) => {
            
            eventEmitter.emit('enhanced-game-flow-progress', {
                ...data,
                session: this.currentSession
            });
        });

        // Room management events
        unifiedWebSocketService.on('ROOM_PLAYERS_UPDATED', (data) => {
            eventEmitter.emit('enhanced-game-flow-players-updated', {
                ...data,
                session: this.currentSession
            });
        });
    }

    /**
     * Get detailed player statistics
     */
    async getPlayerStatistics(userId) {
        if (!this.currentSession) {
            return null;
        }

        try {
            const userAnswers = await getUserAnswersInSession(userId, this.currentSession.id);
            const roomRankings = await getRoomRankings(this.currentSession.roomId);
            
            return {
                userAnswers,
                rankings: roomRankings,
                session: this.currentSession
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Leave game and cleanup
     */
    async leaveGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        // Update session state if host
        if (this.isHost && this.currentSession) {
            try {
                await updateGameSessionState(this.currentSession.id, {
                    gameState: 'finished'
                });
            } catch (error) {
            }
        }

        this.currentGameState = 'idle';
        this.currentRoom = null;
        this.currentSession = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.playerScores.clear();

        eventEmitter.emit('enhanced-game-flow-left');
    }

    /**
     * Helper method to get room ID from room code
     */
    async getRoomIdFromCode(roomCode) {
        try {
            // Call actual API to get room by code
            const response = await fetch(`/api/rooms/by-code/${roomCode}`);
            const room = await response.json();
            return room.id;
        } catch (error) {
            throw new Error('Unable to find room with provided code');
        }
    }

    /**
     * Get current state summary
     */
    getCurrentState() {
        return {
            gameState: this.currentGameState,
            room: this.currentRoom,
            session: this.currentSession,
            isHost: this.isHost,
            currentQuestionIndex: this.currentQuestionIndex,
            totalQuestions: this.questions.length,
            userAnswersCount: this.userAnswers.length,
            playerScoresCount: this.playerScores.size
        };
    }

    /**
     * Start synchronized countdown for all players
     */
    startSynchronizedCountdown() {
        if (!this.isHost || !this.currentRoom) {
            return;
        }

        this.currentGameState = 'countdown';
        
        // Emit countdown started event locally
        eventEmitter.emit('enhanced-game-flow-state-changed', {
            state: 'countdown',
            data: { countdown: 3 },
            session: this.currentSession
        });

        // Send countdown events to all players
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            // Emit countdown via WebSocket to all players in room
            unifiedWebSocketService.send('game-countdown', {
                roomCode: this.currentRoom,
                countdown: countdown
            });

            // Emit locally as well
            eventEmitter.emit('enhanced-game-countdown', {
                countdown: countdown,
                roomCode: this.currentRoom
            });

            countdown--;

            if (countdown < 0) {
                clearInterval(countdownInterval);
                
                // Start the actual game
                setTimeout(() => {
                    this.startActualGame();
                }, 1000);
            }
        }, 1000);
    }

    /**
     * Start the actual game after countdown
     */
    async startActualGame() {
        try {
            this.currentGameState = 'playing';
            
            // Update session state to playing
            await updateGameSessionState(this.currentSession.id, {
                gameState: 'playing',
                currentQuestionIndex: 0
            });

            // Get first question
            const firstQuestion = this.questions[0];
            
            // Emit game actually started to all players
            unifiedWebSocketService.send('game-actually-started', {
                roomCode: this.currentRoom,
                question: firstQuestion,
                questionIndex: 0,
                totalQuestions: this.questions.length,
                timeLimit: this.currentSession.timePerQuestion
            });

            // Emit locally as well
            eventEmitter.emit('enhanced-game-actually-started', {
                question: firstQuestion,
                questionIndex: 0,
                totalQuestions: this.questions.length,
                timeLimit: this.currentSession.timePerQuestion,
                roomCode: this.currentRoom
            });

        } catch (error) {
            eventEmitter.emit('enhanced-game-error', {
                error: 'Failed to start game after countdown'
            });
        }
    }
}

// Export singleton instance
const enhancedGameFlowService = new EnhancedGameFlowService();
export default enhancedGameFlowService;
