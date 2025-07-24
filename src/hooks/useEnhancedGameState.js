import { useState, useEffect, useCallback } from 'react';
import enhancedGameFlowService from '../services/enhancedGameFlowService';
import eventEmitter from '../services/eventEmitter';

/**
 * Enhanced Game State Hook
 * Provides comprehensive game state management with new backend APIs
 */
const useEnhancedGameState = (roomCode, isHost, userId) => {
    // Core game state
    const [gameState, setGameState] = useState('idle');
    const [currentSession, setCurrentSession] = useState(null);
    const [players, setPlayers] = useState([]);
    
    // Question and gameplay state
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [countdownValue, setCountdownValue] = useState(null);
    
    // Results and statistics
    const [gameResults, setGameResults] = useState(null);
    const [scoreboard, setScoreboard] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [playerStats, setPlayerStats] = useState(null);
    const [sessionStats, setSessionStats] = useState(null);
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize game when component mounts
    useEffect(() => {
        if (roomCode && userId) {
            initializeGame();
        }

        return () => {
            // Cleanup on unmount
            enhancedGameFlowService.leaveGame();
        };
    }, [roomCode, userId, isHost]);

    // Initialize enhanced game flow
    const initializeGame = async () => {
        try {
            setLoading(true);
            setError(null);
            await enhancedGameFlowService.initializeGame(roomCode, isHost, userId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Start game (host only)
    const startGame = useCallback(async (options = {}) => {
        if (!isHost) {
            throw new Error('Only host can start the game');
        }

        try {
            setLoading(true);
            setError(null);
            const result = await enhancedGameFlowService.startGameAsHost(userId, options);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isHost, userId]);

    // Submit answer
    const submitAnswer = useCallback(async (questionId, selectedAnswerId, timeTaken) => {
        try {
            setError(null);
            const result = await enhancedGameFlowService.submitAnswer(questionId, selectedAnswerId, timeTaken);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Get game status
    const refreshGameStatus = useCallback(async () => {
        try {
            const status = await enhancedGameFlowService.getEnhancedGameStatus();
            if (status) {
                setSessionStats(status.sessionStats);
                setScoreboard(status.leaderboard);
                setCurrentSession(status.currentSession);
            }
            return status;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, []);

    // Get player statistics
    const getPlayerStats = useCallback(async (targetUserId = userId) => {
        try {
            const stats = await enhancedGameFlowService.getPlayerStatistics(targetUserId);
            if (targetUserId === userId) {
                setPlayerStats(stats);
            }
            return stats;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [userId]);

    // Setup event listeners
    useEffect(() => {
        // Game state changes
        const handleStateChanged = (data) => {
            setGameState(data.state);
            setCurrentSession(data.session);
        };

        // Game started preparation
        const handleGameStarted = (data) => {
            setGameState('preparing');
            setCurrentSession(data.session);
            // Don't start actual game yet, wait for countdown
        };

        // Countdown event - synchronized for all players
        const handleCountdown = (data) => {
            setGameState('countdown');
            setCountdownValue(data.countdownValue);
            setCurrentSession(data.session || currentSession);
        };

        // Game actually started after countdown
        const handleGameActuallyStarted = (data) => {
            setGameState('started');
            setCountdownValue(null);
            setCurrentSession(data.session || currentSession);
        };

        // Question received
        const handleQuestion = (data) => {
            setCurrentQuestion(data.question);
            setQuestionIndex(data.questionIndex);
            setTotalQuestions(data.totalQuestions);
            setTimeRemaining(data.question?.timeLimit || 30);
            setGameState('playing');
        };

        // Answer result
        const handleAnswerResult = (data) => {
            // Update user answers locally
            setUserAnswers(prev => [...prev, {
                questionId: data.questionId,
                isCorrect: data.isCorrect,
                pointsEarned: data.pointsEarned,
                timeBonus: data.timeBonus,
                submittedAt: new Date().toISOString()
            }]);
        };

        // Scoreboard update
        const handleScoreboardUpdate = (data) => {
            setScoreboard(data.scoreboard || []);
        };

        // Game finished
        const handleGameFinished = (data) => {
            setGameState('finished');
            setGameResults(data);
            setScoreboard(data.finalLeaderboard || []);
            setSessionStats(data.finalStats);
        };

        // Game progress
        const handleGameProgress = (data) => {
            // Update any progress-related state
        };

        // Players updated
        const handlePlayersUpdated = (data) => {
            if (data.players) {
                setPlayers(data.players);
            }
        };

        // Answer submitted locally
        const handleAnswerSubmitted = (data) => {
        };

        // Register event listeners
        eventEmitter.on('enhanced-game-flow-state-changed', handleStateChanged);
        eventEmitter.on('enhanced-game-flow-game-started', handleGameStarted);
        eventEmitter.on('enhanced-game-flow-countdown', handleCountdown);
        eventEmitter.on('enhanced-game-countdown', handleCountdown);
        eventEmitter.on('enhanced-game-actually-started', handleGameActuallyStarted);
        eventEmitter.on('enhanced-game-flow-question', handleQuestion);
        eventEmitter.on('enhanced-game-flow-answer-result', handleAnswerResult);
        eventEmitter.on('enhanced-game-flow-scoreboard-update', handleScoreboardUpdate);
        eventEmitter.on('enhanced-game-flow-game-finished', handleGameFinished);
        eventEmitter.on('enhanced-game-flow-progress', handleGameProgress);
        eventEmitter.on('enhanced-game-flow-players-updated', handlePlayersUpdated);
        eventEmitter.on('enhanced-answer-submitted', handleAnswerSubmitted);

        // Cleanup listeners
        return () => {
            eventEmitter.off('enhanced-game-flow-state-changed', handleStateChanged);
            eventEmitter.off('enhanced-game-flow-game-started', handleGameStarted);
            eventEmitter.off('enhanced-game-flow-countdown', handleCountdown);
            eventEmitter.off('enhanced-game-countdown', handleCountdown);
            eventEmitter.off('enhanced-game-actually-started', handleGameActuallyStarted);
            eventEmitter.off('enhanced-game-flow-question', handleQuestion);
            eventEmitter.off('enhanced-game-flow-answer-result', handleAnswerResult);
            eventEmitter.off('enhanced-game-flow-scoreboard-update', handleScoreboardUpdate);
            eventEmitter.off('enhanced-game-flow-game-finished', handleGameFinished);
            eventEmitter.off('enhanced-game-flow-progress', handleGameProgress);
            eventEmitter.off('enhanced-game-flow-players-updated', handlePlayersUpdated);
            eventEmitter.off('enhanced-answer-submitted', handleAnswerSubmitted);
        };
    }, []);

    // Timer effect for question countdown
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Auto-submit when time runs out
                        if (currentQuestion && !userAnswers.find(a => a.questionId === currentQuestion.id)) {
                            submitAnswer(currentQuestion.id, null, currentQuestion.timeLimit);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [gameState, timeRemaining, currentQuestion, userAnswers, submitAnswer]);

    return {
        // Core state
        gameState,
        currentSession,
        players,
        
        // Question state
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeRemaining,
        countdownValue,
        
        // Results state
        gameResults,
        scoreboard,
        userAnswers,
        playerStats,
        sessionStats,
        
        // UI state
        loading,
        error,
        
        // Actions
        startGame,
        submitAnswer,
        refreshGameStatus,
        getPlayerStats,
        
        // Utilities
        isHost,
        currentUserId: userId,
        hasAnsweredCurrentQuestion: currentQuestion ? 
            userAnswers.some(a => a.questionId === currentQuestion.id) : false,
        gameProgress: totalQuestions > 0 ? (questionIndex / totalQuestions) * 100 : 0,
        
        // Enhanced state
        getCurrentState: () => enhancedGameFlowService.getCurrentState()
    };
};

export default useEnhancedGameState;
