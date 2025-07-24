/**
 * Enhanced WebSocket Event Handler
 * Handles all new game flow events according to backend API specification
 */

import unifiedWebSocketService from './unifiedWebSocketService.js';
import eventEmitter from './eventEmitter';

class EnhancedWebSocketEventHandler {
    constructor() {
        this.setupGameFlowEvents();
        this.setupRoomManagementEvents();
    }

    /**
     * Setup game flow event handlers
     */
    setupGameFlowEvents() {
        // Game Start Event - Initial trigger from host
        unifiedWebSocketService.on('game-start', (data) => {
            
            // Emit preparation event for all players
            eventEmitter.emit('enhanced-game-start', {
                roomCode: data.roomCode,
                gameSessionId: data.gameSessionId,
                totalQuestions: data.totalQuestions,
                timePerQuestion: data.timePerQuestion,
                timestamp: Date.now()
            });
        });

        // Game Countdown Event - Synchronized countdown for ALL players
        unifiedWebSocketService.on('game-countdown', (data) => {
            
            eventEmitter.emit('enhanced-game-countdown', {
                countdownValue: data.countdownValue || data.value || 3,
                totalCountdown: data.totalCountdown || 3,
                roomCode: data.roomCode,
                timestamp: Date.now()
            });
        });

        // Game Actually Started Event - After countdown completes
        unifiedWebSocketService.on('game-actually-started', (data) => {
            
            eventEmitter.emit('enhanced-game-actually-started', {
                roomCode: data.roomCode,
                gameSessionId: data.gameSessionId,
                timestamp: Date.now()
            });
        });

        // Next Question Event
        unifiedWebSocketService.on('next-question', (data) => {
            
            const questionData = {
                questionNumber: data.questionNumber,
                question: data.question,
                timeLimit: data.question.timeLimit,
                questionIndex: data.questionNumber - 1,
                timestamp: Date.now()
            };
            
            eventEmitter.emit('enhanced-next-question', questionData);
        });

        // Submit Answer Event (from other players)
        unifiedWebSocketService.on('submit-answer', (data) => {
            
            eventEmitter.emit('enhanced-player-answered', {
                userId: data.userId,
                questionId: data.questionId,
                selectedAnswerId: data.selectedAnswerId,
                timeTaken: data.timeTaken,
                timestamp: Date.now()
            });
        });

        // Answer Result Event
        unifiedWebSocketService.on('answer-result', (data) => {
            
            eventEmitter.emit('enhanced-answer-result', {
                userId: data.userId,
                isCorrect: data.isCorrect,
                correctAnswerId: data.correctAnswerId,
                pointsEarned: data.pointsEarned,
                timeBonus: data.timeBonus,
                timestamp: Date.now()
            });
        });

        // Game Countdown Event - for synchronized countdown
        unifiedWebSocketService.on('game-countdown', (data) => {
            
            eventEmitter.emit('enhanced-game-countdown', {
                countdown: data.countdown,
                roomCode: data.roomCode,
                timestamp: Date.now()
            });
        });

        // Game Actually Started Event - after countdown
        unifiedWebSocketService.on('game-actually-started', (data) => {
            
            eventEmitter.emit('enhanced-game-actually-started', {
                question: data.question,
                questionIndex: data.questionIndex,
                totalQuestions: data.totalQuestions,
                timeLimit: data.timeLimit,
                roomCode: data.roomCode,
                timestamp: Date.now()
            });
        });

        // Scoreboard Update Event
        unifiedWebSocketService.on('scoreboard-update', (data) => {
            
            eventEmitter.emit('enhanced-scoreboard-update', {
                scoreboard: data.scoreboard,
                timestamp: Date.now()
            });
        });

        // Game End Event
        unifiedWebSocketService.on('game-end', (data) => {
            eventEmitter.emit('enhanced-game-end', {
                finalScoreboard: data.finalScoreboard,
                gameStats: data.gameStats,
                timestamp: Date.now()
            });
        });

        // Handle legacy event names for backward compatibility
        this.setupLegacyEventHandlers();
    }

    /**
     * Setup room management event handlers
     */
    setupRoomManagementEvents() {
        // Player Joined Event
        unifiedWebSocketService.on('player-joined', (data) => {
            eventEmitter.emit('enhanced-player-joined', {
                roomCode: data.roomCode,
                player: data.player,
                totalPlayers: data.totalPlayers,
                timestamp: Date.now()
            });
        });

        // Player Left Event
        unifiedWebSocketService.on('player-left', (data) => {
            eventEmitter.emit('enhanced-player-left', {
                roomCode: data.roomCode,
                userId: data.userId,
                totalPlayers: data.totalPlayers,
                timestamp: Date.now()
            });
        });

        // Room Players Update Event
        unifiedWebSocketService.on('room-players-update', (data) => {
            eventEmitter.emit('enhanced-room-players-update', {
                roomCode: data.roomCode,
                players: data.players,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Setup legacy event handlers for backward compatibility
     */
    setupLegacyEventHandlers() {
        // Map legacy events to new enhanced events
        const legacyMappings = {
            'GAME_STARTED': 'enhanced-game-start',
            'QUESTION_SENT': 'enhanced-next-question',
            'ANSWER_RESULT': 'enhanced-answer-result',
            'SCOREBOARD_UPDATE': 'enhanced-scoreboard-update',
            'GAME_FINISHED': 'enhanced-game-end',
            'ROOM_PLAYERS_UPDATED': 'enhanced-room-players-update'
        };

        Object.entries(legacyMappings).forEach(([legacyEvent, newEvent]) => {
            unifiedWebSocketService.on(legacyEvent, (data) => {
                eventEmitter.emit(newEvent, {
                    ...data,
                    timestamp: Date.now(),
                    source: 'legacy'
                });
            });
        });
    }

    /**
     * Send enhanced game events
     */
    sendSubmitAnswer(questionId, selectedAnswerId, timeTaken, roomCode) {
        const eventData = {
            eventType: 'submit-answer',
            data: {
                questionId,
                selectedAnswerId,
                timeTaken,
                roomCode,
                timestamp: Date.now()
            }
        };

        unifiedWebSocketService.send('submit-answer', eventData.data);
        
        // Also emit locally for immediate UI feedback
        eventEmitter.emit('enhanced-answer-submitted-local', eventData.data);
    }

    sendPlayerReady(roomCode, ready = true) {
        const eventData = {
            eventType: 'player-ready',
            data: {
                roomCode,
                ready,
                timestamp: Date.now()
            }
        };

        unifiedWebSocketService.send('player-ready', eventData.data);
    }

    sendStartGame(roomCode, gameOptions = {}) {
        const eventData = {
            eventType: 'start-game',
            data: {
                roomCode,
                ...gameOptions,
                timestamp: Date.now()
            }
        };

        unifiedWebSocketService.send('start-game', eventData.data);
    }

    sendJoinRoom(roomCode, username, userId) {
        const eventData = {
            eventType: 'join-room',
            data: {
                roomCode,
                username,
                userId,
                timestamp: Date.now()
            }
        };

        unifiedWebSocketService.send('join-room', eventData.data);
    }

    sendLeaveRoom(roomCode, username, userId) {
        const eventData = {
            eventType: 'leave-room',
            data: {
                roomCode,
                username,
                userId,
                timestamp: Date.now()
            }
        };

        unifiedWebSocketService.send('leave-room', eventData.data);
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: websocketService.isConnected(),
            currentRoom: websocketService.currentRoom,
            timestamp: Date.now()
        };
    }

    /**
     * Setup real-time answer tracking
     */
    startAnswerTracking(questionId, timeLimit) {
        const trackingData = {
            questionId,
            timeLimit,
            startTime: Date.now(),
            playersAnswered: new Set()
        };

        // Listen for answer submissions during this question
        const handlePlayerAnswered = (data) => {
            if (data.questionId === questionId) {
                trackingData.playersAnswered.add(data.userId);
                
                eventEmitter.emit('enhanced-answer-tracking-update', {
                    questionId,
                    playersAnswered: Array.from(trackingData.playersAnswered),
                    totalAnswered: trackingData.playersAnswered.size,
                    timeElapsed: Date.now() - trackingData.startTime
                });
            }
        };

        eventEmitter.on('enhanced-player-answered', handlePlayerAnswered);

        // Cleanup after question time limit
        setTimeout(() => {
            eventEmitter.off('enhanced-player-answered', handlePlayerAnswered);
            
            eventEmitter.emit('enhanced-answer-tracking-complete', {
                questionId,
                finalAnswerCount: trackingData.playersAnswered.size,
                totalTime: timeLimit * 1000
            });
        }, timeLimit * 1000);

        return trackingData;
    }

    /**
     * Setup real-time game statistics
     */
    startGameStatistics() {
        const stats = {
            gameStartTime: Date.now(),
            questionsAsked: 0,
            totalAnswers: 0,
            correctAnswers: 0,
            averageResponseTime: 0,
            playerPerformance: new Map()
        };

        // Track question events
        eventEmitter.on('enhanced-next-question', () => {
            stats.questionsAsked++;
            eventEmitter.emit('enhanced-game-stats-update', { ...stats });
        });

        // Track answer results
        eventEmitter.on('enhanced-answer-result', (data) => {
            stats.totalAnswers++;
            if (data.isCorrect) {
                stats.correctAnswers++;
            }

            // Update player performance
            if (!stats.playerPerformance.has(data.userId)) {
                stats.playerPerformance.set(data.userId, {
                    totalAnswers: 0,
                    correctAnswers: 0,
                    totalPoints: 0
                });
            }

            const playerStats = stats.playerPerformance.get(data.userId);
            playerStats.totalAnswers++;
            if (data.isCorrect) {
                playerStats.correctAnswers++;
            }
            playerStats.totalPoints += data.pointsEarned || 0;

            eventEmitter.emit('enhanced-game-stats-update', { ...stats });
        });

        return stats;
    }

    /**
     * Cleanup event listeners
     */
    cleanup() {
        // Remove all enhanced event listeners
        const enhancedEvents = [
            'enhanced-game-start',
            'enhanced-next-question',
            'enhanced-player-answered',
            'enhanced-answer-result',
            'enhanced-scoreboard-update',
            'enhanced-game-end',
            'enhanced-player-joined',
            'enhanced-player-left',
            'enhanced-room-players-update'
        ];

        enhancedEvents.forEach(event => {
            eventEmitter.removeAllListeners(event);
        });
    }
}

// Export singleton instance
const enhancedWebSocketEventHandler = new EnhancedWebSocketEventHandler();
export default enhancedWebSocketEventHandler;
