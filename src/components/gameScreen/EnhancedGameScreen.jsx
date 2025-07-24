import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import EnhancedCountdownScreen from './EnhancedCountdownScreen';
import QuestionScreen from './QuestionScreen';
import GameEndScreen from './GameEndScreen';
import useEnhancedGameState from '../../hooks/useEnhancedGameState';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../style/components/gameScreen/EnhancedGameScreen.css';

/**
 * Enhanced Game Screen with full real-time features
 */
const EnhancedGameScreen = ({ roomCode, isHost, currentUserId, onLeaveGame }) => {
    const {
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
        hasAnsweredCurrentQuestion,
        gameProgress,
        getCurrentState
    } = useEnhancedGameState(roomCode, isHost, currentUserId);

    const [showStats, setShowStats] = useState(false);
    const [playerStats, setPlayerStats] = useState(null);

    // Refresh game status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (gameState === 'playing' || gameState === 'started') {
                refreshGameStatus();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [gameState, refreshGameStatus]);

    // Handle game start (host only)
    const handleStartGame = async (gameOptions) => {
        try {
            await startGame(gameOptions);
        } catch (error) {
        }
    };

    // Handle answer submission
    const handleSubmitAnswer = async (selectedAnswerId, timeTaken) => {
        if (!currentQuestion || hasAnsweredCurrentQuestion) {
            return;
        }

        try {
            await submitAnswer(currentQuestion.id, selectedAnswerId, timeTaken);
        } catch (error) {
        }
    };

    // Show player statistics
    const handleShowStats = async () => {
        try {
            const stats = await getPlayerStats(currentUserId);
            setPlayerStats(stats);
            setShowStats(true);
        } catch (error) {
        }
    };

    // Handle leave game
    const handleLeaveGame = () => {
        if (onLeaveGame) {
            onLeaveGame();
        }
    };

    // Render game controls (for host)
    const renderGameControls = () => {
        if (!isHost || gameState !== 'lobby') {
            return null;
        }

        return (
            <div className="game-controls">
                <h3>Game Setup</h3>
                <button 
                    onClick={() => handleStartGame({ questionCount: 10, timeLimit: 30 })}
                    disabled={loading}
                    className="start-game-btn"
                >
                    {loading ? 'Starting...' : 'Start Game'}
                </button>
            </div>
        );
    };

    // Render game info panel
    const renderGameInfo = () => {
        return (
            <div className="game-info-panel">
                <div className="game-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${gameProgress}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        Question {questionIndex + 1} of {totalQuestions}
                    </span>
                </div>
                
                {currentSession && (
                    <div className="session-info">
                        <span>Session ID: {currentSession.id}</span>
                        <span>State: {gameState}</span>
                    </div>
                )}
                
                <div className="game-actions">
                    <button onClick={handleShowStats} className="stats-btn">
                        View Stats
                    </button>
                    <button onClick={refreshGameStatus} className="refresh-btn">
                        Refresh
                    </button>
                    <button onClick={handleLeaveGame} className="leave-btn">
                        Leave Game
                    </button>
                </div>
            </div>
        );
    };

    // Render scoreboard
    const renderScoreboard = () => {
        if (!scoreboard || scoreboard.length === 0) {
            return null;
        }

        return (
            <div className="scoreboard">
                <h4>Current Standings</h4>
                <div className="scoreboard-list">
                    {scoreboard.slice(0, 5).map((player, index) => (
                        <div 
                            key={player.userId} 
                            className={`scoreboard-item ${player.userId === currentUserId ? 'current-player' : ''}`}
                        >
                            <span className="rank">#{index + 1}</span>
                            <span className="username">{player.username}</span>
                            <span className="score">{player.currentScore} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render main game content
    const renderGameContent = () => {
        if (loading) {
            return <LoadingSpinner message="Loading game..." />;
        }

        if (error) {
            return <ErrorMessage message={error} onRetry={refreshGameStatus} />;
        }

        switch (gameState) {
            case 'lobby':
                return (
                    <div className="lobby-screen">
                        <h2>Waiting for Game to Start</h2>
                        <div className="players-waiting">
                            <h3>Players in Room ({players.length})</h3>
                            <div className="players-list">
                                {players.map(player => (
                                    <div key={player.userId} className="player-item">
                                        <span className="player-name">{player.username}</span>
                                        {player.isHost && <span className="host-badge">HOST</span>}
                                        {player.isReady && <span className="ready-badge">READY</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {renderGameControls()}
                    </div>
                );

            case 'preparing':
                return (
                    <div className="preparing-screen">
                        <h2>🎮 Get Ready!</h2>
                        <p>Game is starting soon...</p>
                        <div className="preparing-animation">
                            <div className="spinner"></div>
                        </div>
                    </div>
                );

            case 'countdown':
                return (
                    <EnhancedCountdownScreen 
                        initialValue={countdownValue || 3}
                        title="Game Starting!"
                        subtitle="All players get ready..."
                        onCountdownComplete={() => {
                            // Countdown complete, game will start automatically
                        }}
                    />
                );

            case 'started':
            case 'playing':
                return (
                    <div className="playing-screen">
                        {renderGameInfo()}
                        <QuestionScreen
                            question={currentQuestion}
                            questionIndex={questionIndex}
                            totalQuestions={totalQuestions}
                            timeRemaining={timeRemaining}
                            onSubmitAnswer={handleSubmitAnswer}
                            disabled={hasAnsweredCurrentQuestion}
                            userAnswer={userAnswers.find(a => a.questionId === currentQuestion?.id)}
                        />
                        {renderScoreboard()}
                    </div>
                );

            case 'finished':
            case 'ended':
                return (
                    <GameEndScreen
                        results={gameResults}
                        scoreboard={scoreboard}
                        currentUserId={currentUserId}
                        sessionStats={sessionStats}
                        userAnswers={userAnswers}
                        onPlayAgain={() => window.location.reload()}
                        onLeaveGame={handleLeaveGame}
                    />
                );

            default:
                return (
                    <div className="unknown-state">
                        <h3>Unknown game state: {gameState}</h3>
                        <button onClick={refreshGameStatus}>Refresh</button>
                    </div>
                );
        }
    };

    // Render player stats modal
    const renderStatsModal = () => {
        if (!showStats || !playerStats) {
            return null;
        }

        return (
            <div className="stats-modal-overlay" onClick={() => setShowStats(false)}>
                <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="stats-header">
                        <h3>Your Statistics</h3>
                        <button onClick={() => setShowStats(false)} className="close-btn">×</button>
                    </div>
                    <div className="stats-content">
                        {playerStats.userAnswers && (
                            <div className="answer-history">
                                <h4>Answer History</h4>
                                {playerStats.userAnswers.map((answer, index) => (
                                    <div key={index} className="answer-item">
                                        <span>Q{index + 1}</span>
                                        <span className={answer.isCorrect ? 'correct' : 'incorrect'}>
                                            {answer.isCorrect ? '✓' : '✗'}
                                        </span>
                                        <span>{answer.pointsEarned} pts</span>
                                        <span>{answer.timeTaken}s</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="enhanced-game-screen">
            {renderGameContent()}
            {renderStatsModal()}
        </div>
    );
};

EnhancedGameScreen.propTypes = {
    roomCode: PropTypes.string.isRequired,
    isHost: PropTypes.bool.isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onLeaveGame: PropTypes.func
};

export default EnhancedGameScreen;
