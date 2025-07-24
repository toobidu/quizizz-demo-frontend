import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../style/components/gameScreen/EnhancedQuestionScreen.css';

/**
 * Enhanced Question Screen with real-time features
 */
const EnhancedQuestionScreen = ({
    question,
    questionIndex,
    totalQuestions,
    timeRemaining,
    onSubmitAnswer,
    disabled = false,
    userAnswer = null
}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime] = useState(Date.now());
    const [showResult, setShowResult] = useState(false);

    // Reset state when question changes
    useEffect(() => {
        setSelectedOption(null);
        setIsSubmitting(false);
        setShowResult(false);
    }, [question?.id]);

    // Show result when user answer is received
    useEffect(() => {
        if (userAnswer) {
            setShowResult(true);
            setSelectedOption(userAnswer.selectedAnswerId);
        }
    }, [userAnswer]);

    // Handle option selection
    const handleOptionSelect = (optionId) => {
        if (disabled || isSubmitting || userAnswer) {
            return;
        }
        setSelectedOption(optionId);
    };

    // Handle answer submission
    const handleSubmit = async () => {
        if (!selectedOption || disabled || isSubmitting || userAnswer) {
            return;
        }

        setIsSubmitting(true);
        const timeTaken = (Date.now() - startTime) / 1000;

        try {
            await onSubmitAnswer(selectedOption, timeTaken);
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeRemaining === 0 && selectedOption && !userAnswer && !isSubmitting) {
            handleSubmit();
        }
    }, [timeRemaining, selectedOption, userAnswer, isSubmitting]);

    // Get option class name based on state
    const getOptionClassName = (option) => {
        let className = 'question-option';
        
        if (selectedOption === option.id) {
            className += ' selected';
        }
        
        if (showResult && userAnswer) {
            if (option.isCorrect) {
                className += ' correct';
            } else if (selectedOption === option.id && !option.isCorrect) {
                className += ' incorrect';
            }
        }
        
        if (disabled || userAnswer) {
            className += ' disabled';
        }
        
        return className;
    };

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get timer class based on time remaining
    const getTimerClassName = () => {
        let className = 'timer';
        if (timeRemaining <= 10) {
            className += ' warning';
        }
        if (timeRemaining <= 5) {
            className += ' critical';
        }
        return className;
    };

    if (!question) {
        return (
            <div className="enhanced-question-screen">
                <div className="loading-question">
                    <div className="spinner"></div>
                    <p>Loading next question...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="enhanced-question-screen">
            {/* Question Header */}
            <div className="question-header">
                <div className="question-meta">
                    <span className="question-number">
                        Question {questionIndex + 1} of {totalQuestions}
                    </span>
                    <div className={getTimerClassName()}>
                        <div className="timer-circle">
                            <div 
                                className="timer-fill"
                                style={{
                                    transform: `rotate(${(1 - timeRemaining / (question.timeLimit || 30)) * 360}deg)`
                                }}
                            />
                            <span className="timer-text">{timeRemaining}</span>
                        </div>
                    </div>
                </div>
                
                {question.difficulty && (
                    <div className={`difficulty ${question.difficulty.toLowerCase()}`}>
                        {question.difficulty}
                    </div>
                )}
            </div>

            {/* Question Content */}
            <div className="question-content">
                <h2 className="question-text">{question.questionText}</h2>
                
                {question.imageUrl && (
                    <div className="question-image">
                        <img src={question.imageUrl} alt="Question" />
                    </div>
                )}
            </div>

            {/* Answer Options */}
            <div className="answer-options">
                {question.options && question.options.map((option, index) => (
                    <button
                        key={option.id}
                        className={getOptionClassName(option)}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={disabled || userAnswer || isSubmitting}
                    >
                        <div className="option-letter">
                            {String.fromCharCode(65 + index)}
                        </div>
                        <div className="option-text">
                            {option.answerText}
                        </div>
                        {showResult && option.isCorrect && (
                            <div className="correct-indicator">✓</div>
                        )}
                        {showResult && selectedOption === option.id && !option.isCorrect && (
                            <div className="incorrect-indicator">✗</div>
                        )}
                    </button>
                ))}
            </div>

            {/* Submit Button */}
            {!userAnswer && (
                <div className="submit-section">
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!selectedOption || isSubmitting || disabled}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner small"></div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Answer'
                        )}
                    </button>
                </div>
            )}

            {/* Answer Result */}
            {userAnswer && (
                <div className="answer-result">
                    <div className={`result-status ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                        {userAnswer.isCorrect ? (
                            <>
                                <div className="result-icon">🎉</div>
                                <div className="result-text">
                                    <h3>Correct!</h3>
                                    <p>+{userAnswer.pointsEarned} points</p>
                                    {userAnswer.timeBonus > 0 && (
                                        <p className="time-bonus">+{userAnswer.timeBonus} time bonus</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="result-icon">😔</div>
                                <div className="result-text">
                                    <h3>Incorrect</h3>
                                    <p>Better luck next time!</p>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="waiting-next">
                        <div className="spinner small"></div>
                        <p>Waiting for next question...</p>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="question-progress">
                <div 
                    className="progress-bar"
                    style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                />
            </div>

            {/* Question Stats (if available) */}
            {question.stats && (
                <div className="question-stats">
                    <div className="stat-item">
                        <span className="stat-label">Difficulty:</span>
                        <span className="stat-value">{question.difficulty || 'Medium'}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Topic:</span>
                        <span className="stat-value">{question.topicName || 'General'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

EnhancedQuestionScreen.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.number.isRequired,
        questionText: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            answerText: PropTypes.string.isRequired,
            isCorrect: PropTypes.bool.isRequired,
            optionIndex: PropTypes.number
        })),
        timeLimit: PropTypes.number,
        difficulty: PropTypes.string,
        imageUrl: PropTypes.string,
        topicName: PropTypes.string,
        stats: PropTypes.object
    }),
    questionIndex: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired,
    timeRemaining: PropTypes.number.isRequired,
    onSubmitAnswer: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    userAnswer: PropTypes.shape({
        selectedAnswerId: PropTypes.number,
        isCorrect: PropTypes.bool,
        pointsEarned: PropTypes.number,
        timeBonus: PropTypes.number
    })
};

export default EnhancedQuestionScreen;
