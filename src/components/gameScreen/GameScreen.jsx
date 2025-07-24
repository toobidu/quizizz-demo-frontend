import React from 'react';
import PropTypes from 'prop-types';
import CountdownScreen from './CountdownScreen';
import QuestionScreen from './QuestionScreen';
import GameEndScreen from './GameEndScreen';
import useGameState from '../../hooks/useGameState';
import '../../style/components/gameScreen/GameScreen.css';

/**
 * Màn hình chơi game
 */
const GameScreen = ({roomCode, isHost, currentUserId, onLeaveGame}) => {
    const {
        gameState,
        players,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeRemaining,
        countdownValue,
        gameResults,
        submitAnswer
    } = useGameState(roomCode, isHost);

    // Tìm người chơi hiện tại
    const currentPlayer = players.find(player => player.userId === currentUserId);

    // Render màn hình dựa vào trạng thái game
    const renderGameContent = () => {
        switch (gameState) {
            case 'countdown':
                return <CountdownScreen value={countdownValue}/>;

            case 'playing':
            case 'question-active':
                return (<QuestionScreen
                    question={currentQuestion}
                    questionIndex={questionIndex}
                    totalQuestions={totalQuestions}
                    timeRemaining={timeRemaining}
                    onSubmitAnswer={submitAnswer}
                />);

            case 'ended':
                return (<GameEndScreen
                    results={gameResults}
                    currentUserId={currentUserId}
                />);

            default:
                return (<div className="game-loading">
                    <h2>Đang chuẩn bị trò chơi...</h2>
                    <p>Vui lòng đợi trong giây lát</p>
                </div>);
        }
    };

    return (<div className="game-screen">
        <div className="game-header">
            <div className="game-info">
                <div className="room-code">Phòng: {roomCode}</div>
                {gameState !== 'ended' && (<div className="question-progress">
                    Câu hỏi: {questionIndex + 1}/{totalQuestions}
                </div>)}
            </div>

            {currentPlayer && (<div className="player-info">
                <span className="player-name">{currentPlayer.username}</span>
                {isHost && <span className="host-badge">Host</span>}
                {onLeaveGame && (
                    <button 
                        className="leave-game-btn"
                        onClick={onLeaveGame}
                        title="Rời khỏi game"
                    >
                        ×
                    </button>
                )}
            </div>)}
        </div>

        <div className="game-content">
            {renderGameContent()}
        </div>
    </div>);
};

GameScreen.propTypes = {
    roomCode: PropTypes.string.isRequired,
    isHost: PropTypes.bool.isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onLeaveGame: PropTypes.func
};

export default GameScreen;
