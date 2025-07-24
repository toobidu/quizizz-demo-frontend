import React, { useState, useEffect, useCallback } from 'react';
import gameFlowService from '../../services/gameFlowService';
import eventEmitter from '../../services/eventEmitter';
import { showNotification } from '../../utils/notificationUtils';

/**
 * GameContainer - Manages complete game flow according to backend API
 * Handles GAME_STARTED, QUESTION_SENT, ANSWER_RESULT, GAME_PROGRESS, SCOREBOARD_UPDATE, GAME_FINISHED
 */
const GameContainer = ({ roomCode, isHost, onGameEnd }) => {
    const [gameState, setGameState] = useState('waiting'); // waiting, started, playing, finished
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameProgress, setGameProgress] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [playerRank, setPlayerRank] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [answerResult, setAnswerResult] = useState(null);

    // Timer for question countdown
    const [timer, setTimer] = useState(null);

    // Initialize game flow service
    useEffect(() => {
        const initGame = async () => {
            try {
                await gameFlowService.initializeGame(roomCode, isHost);
                
            } catch (error) {
                
                showNotification('Lỗi khởi tạo game. Vui lòng thử lại!', 'error');
            }
        };

        if (roomCode) {
            initGame();
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [roomCode, isHost]);

    // Handle game events from backend
    useEffect(() => {
        // GAME_STARTED event
        const handleGameStarted = (data) => {
            
            setGameState('started');
            setTotalQuestions(data.totalQuestions || 10);
            showNotification('Game đã bắt đầu! Chuẩn bị cho câu hỏi đầu tiên...', 'success');
        };

        // QUESTION_SENT event
        const handleQuestionSent = (data) => {
            
            setCurrentQuestion(data);
            setQuestionIndex(data.currentQuestion - 1); // Convert to 0-based index
            setTotalQuestions(data.totalQuestions);
            setTimeRemaining(data.timeLimit);
            setGameState('playing');
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
            setAnswerResult(null);

            // Start countdown timer
            startQuestionTimer(data.timeLimit);

            showNotification(`Câu hỏi ${data.currentQuestion}/${data.totalQuestions}`, 'info');
        };

        // ANSWER_RESULT event
        const handleAnswerResult = (data) => {
            
            setAnswerResult(data);
            setPlayerScore(data.totalPoints || 0);
            setPlayerRank(data.rank || 0);

            const message = data.isCorrect 
                ? `Chính xác! +${data.pointsEarned} điểm` 
                : `Sai rồi. Đáp án đúng: ${data.correctAnswerText}`;
            
            showNotification(message, data.isCorrect ? 'success' : 'error');
        };

        // GAME_PROGRESS event
        const handleGameProgress = (data) => {
            
            setGameProgress(data.gameProgress || 0);
        };

        // SCOREBOARD_UPDATE event
        const handleScoreboardUpdate = (data) => {
            
            setLeaderboard(data.leaderboard || []);
        };

        // GAME_FINISHED event
        const handleGameFinished = (data) => {
            
            setGameState('finished');
            setLeaderboard(data.leaderboard || []);
            
            if (timer) {
                clearInterval(timer);
                setTimer(null);
            }

            showNotification('Game đã kết thúc! Xem kết quả cuối cùng.', 'info');
            
            // Call parent callback
            if (onGameEnd) {
                onGameEnd(data);
            }
        };

        // Register event listeners
        eventEmitter.on('game-flow-game-started', handleGameStarted);
        eventEmitter.on('game-flow-question', handleQuestionSent);
        eventEmitter.on('game-flow-answer-result', handleAnswerResult);
        eventEmitter.on('game-flow-game-progress', handleGameProgress);
        eventEmitter.on('game-flow-scoreboard-update', handleScoreboardUpdate);
        eventEmitter.on('game-flow-game-finished', handleGameFinished);

        // Cleanup
        return () => {
            eventEmitter.off('game-flow-game-started', handleGameStarted);
            eventEmitter.off('game-flow-question', handleQuestionSent);
            eventEmitter.off('game-flow-answer-result', handleAnswerResult);
            eventEmitter.off('game-flow-game-progress', handleGameProgress);
            eventEmitter.off('game-flow-scoreboard-update', handleScoreboardUpdate);
            eventEmitter.off('game-flow-game-finished', handleGameFinished);
            
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [timer, onGameEnd]);

    // Start countdown timer for question
    const startQuestionTimer = useCallback((timeLimit) => {
        if (timer) {
            clearInterval(timer);
        }

        let remainingTime = timeLimit;
        setTimeRemaining(remainingTime);

        const newTimer = setInterval(() => {
            remainingTime -= 1;
            setTimeRemaining(remainingTime);

            if (remainingTime <= 0) {
                clearInterval(newTimer);
                setTimer(null);
                
                // Auto-submit if no answer selected
                if (!isAnswerSubmitted) {
                    handleTimeUp();
                }
            }
        }, 1000);

        setTimer(newTimer);
    }, [timer, isAnswerSubmitted]);

    // Handle time up (auto-submit)
    const handleTimeUp = useCallback(() => {
        if (currentQuestion && !isAnswerSubmitted) {
            // Submit with no answer (or first option as default)
            const defaultOptionId = currentQuestion.options?.[0]?.id;
            if (defaultOptionId) {
                handleAnswerSubmit(defaultOptionId, currentQuestion.timeLimit);
            }
            showNotification('Hết giờ! Tự động gửi câu trả lời.', 'warning');
        }
    }, [currentQuestion, isAnswerSubmitted]);

    // Handle answer submission
    const handleAnswerSubmit = useCallback(async (optionId, timeToAnswer = null) => {
        if (!currentQuestion || isAnswerSubmitted) return;

        try {
            const actualTimeToAnswer = timeToAnswer || (currentQuestion.timeLimit - timeRemaining);
            
            setSelectedAnswer(optionId);
            setIsAnswerSubmitted(true);

            // Clear timer
            if (timer) {
                clearInterval(timer);
                setTimer(null);
            }

            // Submit answer via gameFlowService
            await gameFlowService.submitAnswer(
                currentQuestion.questionId || currentQuestion.id,
                optionId,
                actualTimeToAnswer
            );

        } catch (error) {
            
            showNotification('Lỗi khi gửi câu trả lời. Vui lòng thử lại!', 'error');
            setIsAnswerSubmitted(false);
        }
    }, [currentQuestion, isAnswerSubmitted, timeRemaining, timer]);

    // Start game (host only)
    const handleStartGame = useCallback(async () => {
        console.log('🎮 [GAME_CONTAINER] === START GAME BUTTON CLICKED ===');
        console.log('🎮 [GAME_CONTAINER] Timestamp:', new Date().toISOString());
        console.log('🎮 [GAME_CONTAINER] Is host:', isHost);
        console.log('🎮 [GAME_CONTAINER] Room code:', roomCode);
        console.log('🎮 [GAME_CONTAINER] Current game state:', gameState);
        
        if (!isHost) {
            console.log('🎮 [GAME_CONTAINER] ❌ User is not host, aborting');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            console.log('🎮 [GAME_CONTAINER] User ID from localStorage:', userId);
            
            const options = {
                selectedTopicIds: selectedTopics,
                questionCount: 10,
                timeLimit: 30
            };
            console.log('🎮 [GAME_CONTAINER] Game options:', options);

            console.log('🎮 [GAME_CONTAINER] 📤 Calling gameFlowService.startGameAsHost...');
            await gameFlowService.startGameAsHost(parseInt(userId), options);
            
            console.log('🎮 [GAME_CONTAINER] ✅ Game start initiated successfully');
            showNotification('Đang bắt đầu game...', 'info');
        } catch (error) {
            console.log('🎮 [GAME_CONTAINER] ❌ Error starting game:', error);
            showNotification('Lỗi khi bắt đầu game. Vui lòng thử lại!', 'error');
        }
    }, [isHost, roomCode, gameState, selectedTopics]);

    // Render different states
    const renderGameContent = () => {
        switch (gameState) {
            case 'waiting':
                return (
                    <div className="game-waiting">
                        <h2>Waiting for game to start...</h2>
                        {isHost && (
                            <button 
                                onClick={handleStartGame}
                                className="btn btn-primary"
                            >
                                Start Game
                            </button>
                        )}
                    </div>
                );

            case 'started':
                return (
                    <div className="game-started">
                        <h2>Game Started!</h2>
                        <p>Get ready for the first question...</p>
                        <div className="game-info">
                            <p>Total Questions: {totalQuestions}</p>
                        </div>
                    </div>
                );

            case 'playing':
                if (!currentQuestion) return <div>Loading question...</div>;
                
                return (
                    <div className="game-playing">
                        <div className="question-header">
                            <div className="progress-info">
                                Question {questionIndex + 1} of {totalQuestions}
                            </div>
                            <div className="timer">
                                Time: {timeRemaining}s
                            </div>
                            <div className="score">
                                Score: {playerScore} (Rank: #{playerRank || 'N/A'})
                            </div>
                        </div>

                        <div className="question-content">
                            <h3>{currentQuestion.questionText}</h3>
                            
                            <div className="options">
                                {currentQuestion.options?.map((option, index) => (
                                    <button
                                        key={option.id}
                                        className={`option-btn ${
                                            selectedAnswer === option.id ? 'selected' : ''
                                        } ${isAnswerSubmitted ? 'disabled' : ''} ${
                                            answerResult && answerResult.isCorrect && selectedAnswer === option.id ? 'correct' : ''
                                        } ${
                                            answerResult && !answerResult.isCorrect && selectedAnswer === option.id ? 'incorrect' : ''
                                        }`}
                                        onClick={() => handleAnswerSubmit(option.id)}
                                        disabled={isAnswerSubmitted}
                                    >
                                        {option.answerText}
                                    </button>
                                ))}
                            </div>

                            {answerResult && (
                                <div className="answer-result">
                                    <div className={`result ${answerResult.isCorrect ? 'correct' : 'incorrect'}`}>
                                        {answerResult.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                    </div>
                                    {!answerResult.isCorrect && (
                                        <div className="correct-answer">
                                            Correct answer: {answerResult.correctAnswerText}
                                        </div>
                                    )}
                                    <div className="points">
                                        Points earned: {answerResult.pointsEarned || 0}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="game-progress-bar">
                            <div className="progress-fill" style={{width: `${gameProgress}%`}}></div>
                        </div>
                    </div>
                );

            case 'finished':
                return (
                    <div className="game-finished">
                        <h2>Game Finished!</h2>
                        <div className="final-score">
                            Your Final Score: {playerScore}
                        </div>
                        <div className="final-rank">
                            Final Rank: #{playerRank || 'N/A'}
                        </div>
                        
                        <div className="leaderboard">
                            <h3>Final Leaderboard</h3>
                            {leaderboard.map((player, index) => (
                                <div key={index} className="leaderboard-item">
                                    <span className="rank">#{player.rank}</span>
                                    <span className="username">{player.username}</span>
                                    <span className="score">{player.score} pts</span>
                                    <span className="stats">
                                        {player.correctAnswers}/{totalQuestions} correct
                                        (avg: {player.averageTime}s)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return <div>Unknown game state</div>;
        }
    };

    return (
        <div className="game-container">
            {renderGameContent()}
        </div>
    );
};

export default GameContainer;
