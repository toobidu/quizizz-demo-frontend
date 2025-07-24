import React from 'react';
import PropTypes from 'prop-types';
import WaitingRoom from '../pages/room/WaitingRoom';
import GameScreen from './gameScreen/GameScreen';
import useGameState from '../hooks/useGameState';
import '../style/pages/room/waitingRoom/GameContainer.css';

/**
 * Container chính cho game, quản lý chuyển đổi giữa phòng chờ và màn hình chơi
 */
const GameContainer = ({roomCode, isHost, currentUserId}) => {
    const {gameState} = useGameState(roomCode, isHost);

    // Xác định xem có đang ở trong game hay không
    const isInGame = ['countdown', 'playing', 'question-active', 'ended'].includes(gameState);

    return (<div className="game-container">
        {!isInGame ? (<WaitingRoom
            roomId={roomCode}
        />) : (<GameScreen
            roomCode={roomCode}
            isHost={isHost}
            currentUserId={currentUserId}
        />)}
    </div>);
};

GameContainer.propTypes = {
    roomCode: PropTypes.string.isRequired,
    isHost: PropTypes.bool.isRequired,
    currentuserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default GameContainer;
