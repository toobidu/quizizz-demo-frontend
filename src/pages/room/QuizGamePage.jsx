import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showNotification } from '../../utils/notificationUtils';
import { getGameQuestions } from '../../config/api/game.api';
import CountdownScreen from '../../components/gameScreen/CountdownScreen';
import QuestionScreen from '../../components/gameScreen/QuestionScreen';
import GameEndScreen from '../../components/gameScreen/GameEndScreen';
import '../../style/pages/room/QuizGamePage.css';

/**
 * Quizizz-style Game Page
 * Shows countdown -> questions -> results
 */
const QuizGamePage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  // Game states
  const [gameState, setGameState] = useState('countdown'); // countdown, question, results
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [questions, setQuestions] = useState([]); // Store all questions from backend
  const [loading, setLoading] = useState(true);
  
  // Initialize game from localStorage and load questions
  useEffect(() => {
    const initializeGame = async () => {
      const roomData = JSON.parse(localStorage.getItem('currentRoom'));
      if (!roomData || roomData.roomCode !== roomCode) {
        
        navigate('/rooms');
        return;
      }
      
      setGameData(roomData);
      setIsHost(roomData.isHost);

      // **USING MOCK DATA**: 10 questions for testing
      const mockQuestions = [
        {
          id: 1,
          question: "What is the capital of France?",
          options: [
            { id: 'a', text: 'London' },
            { id: 'b', text: 'Paris' },
            { id: 'c', text: 'Berlin' },
            { id: 'd', text: 'Madrid' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 2,
          question: "Which planet is closest to the Sun?",
          options: [
            { id: 'a', text: 'Venus' },
            { id: 'b', text: 'Mercury' },
            { id: 'c', text: 'Mars' },
            { id: 'd', text: 'Earth' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 3,
          question: "What is 2 + 2?",
          options: [
            { id: 'a', text: '3' },
            { id: 'b', text: '4' },
            { id: 'c', text: '5' },
            { id: 'd', text: '6' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 4,
          question: "Who painted the Mona Lisa?",
          options: [
            { id: 'a', text: 'Van Gogh' },
            { id: 'b', text: 'Leonardo da Vinci' },
            { id: 'c', text: 'Picasso' },
            { id: 'd', text: 'Monet' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 5,
          question: "Which is the largest ocean on Earth?",
          options: [
            { id: 'a', text: 'Atlantic Ocean' },
            { id: 'b', text: 'Pacific Ocean' },
            { id: 'c', text: 'Indian Ocean' },
            { id: 'd', text: 'Arctic Ocean' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 6,
          question: "What is the chemical symbol for gold?",
          options: [
            { id: 'a', text: 'Go' },
            { id: 'b', text: 'Au' },
            { id: 'c', text: 'Gd' },
            { id: 'd', text: 'Ag' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 7,
          question: "Which country hosted the 2016 Summer Olympics?",
          options: [
            { id: 'a', text: 'China' },
            { id: 'b', text: 'Brazil' },
            { id: 'c', text: 'UK' },
            { id: 'd', text: 'Japan' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 8,
          question: "What is the square root of 64?",
          options: [
            { id: 'a', text: '6' },
            { id: 'b', text: '8' },
            { id: 'c', text: '7' },
            { id: 'd', text: '9' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 9,
          question: "Which gas makes up most of Earth's atmosphere?",
          options: [
            { id: 'a', text: 'Oxygen' },
            { id: 'b', text: 'Nitrogen' },
            { id: 'c', text: 'Carbon Dioxide' },
            { id: 'd', text: 'Hydrogen' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        },
        {
          id: 10,
          question: "In which year did World War II end?",
          options: [
            { id: 'a', text: '1944' },
            { id: 'b', text: '1945' },
            { id: 'c', text: '1946' },
            { id: 'd', text: '1947' }
          ],
          correctAnswer: 'b',
          timeLimit: 30
        }
      ];
      
      setQuestions(mockQuestions);
      setTotalQuestions(mockQuestions.length);
      
      setLoading(false);
    };
    
    initializeGame();
  }, [roomCode, navigate]);

  // Countdown effect
  useEffect(() => {
    if (gameState === 'countdown' && countdownValue > 0) {
      const timer = setTimeout(() => {
        if (countdownValue === 1) {
          // Start game after countdown
          setGameState('question');
          loadFirstQuestion();
        } else {
          setCountdownValue(countdownValue - 1);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, countdownValue]);

  // Question timer effect
  useEffect(() => {
    if (gameState === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState === 'question' && timeLeft === 0) {
      // Time up, auto-submit or move to next question
      handleTimeUp();
    }
  }, [gameState, timeLeft]);

  const loadFirstQuestion = () => {
    if (questions.length === 0) {
      
      showNotification('Không có câu hỏi để hiển thị!', 'error');
      setGameState('results'); // End game if no questions
      return;
    }
    
    const firstQuestion = questions[0];
    setCurrentQuestion(firstQuestion);
    setTimeLeft(firstQuestion.timeLimit);
    
  };

  const handleAnswerSubmit = (selectedOption) => {

    // Calculate score
    if (selectedOption === currentQuestion?.correctAnswer) {
      const timeBonus = Math.max(0, timeLeft * 10);
      const questionScore = 1000 + timeBonus;
      setScore(score + questionScore);
      showNotification(`Correct! +${questionScore} points`, 'success');
    } else {
      showNotification('Wrong answer!', 'error');
    }
    
    // Move to next question or end game
    setTimeout(() => {
      if (questionNumber < totalQuestions && questionNumber < questions.length) {
        loadNextQuestion();
      } else {
        endGame();
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    
    showNotification('Time up!', 'warning');
    
    setTimeout(() => {
      if (questionNumber < totalQuestions && questionNumber < questions.length) {
        loadNextQuestion();
      } else {
        endGame();
      }
    }, 1500);
  };

  const loadNextQuestion = () => {
    if (questionNumber >= questions.length) {
      
      endGame();
      return;
    }
    
    const nextQuestionIndex = questionNumber; // questionNumber is 1-based, array is 0-based
    const nextQuestion = questions[nextQuestionIndex];
    
    if (!nextQuestion) {
      
      endGame();
      return;
    }
    
    setCurrentQuestion(nextQuestion);
    setQuestionNumber(questionNumber + 1);
    setTimeLeft(nextQuestion.timeLimit);
    
  };

  const endGame = () => {
    
    setGameState('results');
    
    // Clean up localStorage
    localStorage.removeItem('gameStarted');
    
    showNotification(`Game completed! Final score: ${score}`, 'success');
  };

  const handleBackToRooms = () => {
    // Clean up
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('gameStarted');
    navigate('/rooms');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="quiz-game-page">
        <div className="loading-container">
          <h2>Đang tải game...</h2>
          <p>Đang chuẩn bị câu hỏi từ các chủ đề đã chọn...</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Render error state if no questions
  if (questions.length === 0 && !loading) {
    return (
      <div className="quiz-game-page">
        <div className="error-container">
          <h2>Không có câu hỏi</h2>
          <p>Không thể tải câu hỏi từ backend. Vui lòng thử lại.</p>
          <button onClick={handleBackToRooms} className="btn btn-primary">
            Quay lại danh sách phòng
          </button>
        </div>
      </div>
    );
  }

  // Render based on game state
  if (gameState === 'countdown') {
    return (
      <div className="quiz-game-page">
        <CountdownScreen value={countdownValue} />
      </div>
    );
  }

  if (gameState === 'question' && currentQuestion) {
    return (
      <div className="quiz-game-page">
        <QuestionScreen
          question={currentQuestion}
          questionIndex={questionNumber - 1} // QuestionScreen expects 0-based index
          totalQuestions={totalQuestions}
          timeRemaining={timeLeft}
          onSubmitAnswer={handleAnswerSubmit}
        />
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="quiz-game-page">
        <GameEndScreen
          score={score}
          totalQuestions={totalQuestions}
          roomCode={roomCode}
          isHost={isHost}
          onBackToRooms={handleBackToRooms}
        />
      </div>
    );
  }

  // Loading state
  return (
    <div className="quiz-game-page">
      <div className="game-loading">
        <h2>Đang tải game...</h2>
      </div>
    </div>
  );
};

export default QuizGamePage;
