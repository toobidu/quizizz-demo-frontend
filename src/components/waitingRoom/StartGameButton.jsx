import React from 'react';
import PropTypes from 'prop-types';
import '../../style/pages/room/waitingRoom/StartGameButton.css';

/**
 * Nút bắt đầu game cho host
 */
const StartGameButton = ({onStartGame, allPlayersReady, playersCount}) => {
    const isDisabled = !allPlayersReady || playersCount < 1;

    return (<div className="start-game-container">
        <button
            className={`start-game-button ${allPlayersReady ? 'active' : 'disabled'}`}
            onClick={onStartGame}
            disabled={isDisabled}
        >
            Bắt đầu trò chơi
        </button>

        {!allPlayersReady && playersCount > 0 && (<div className="start-game-message">
            Đang chờ tất cả người chơi sẵn sàng...
        </div>)}

        {playersCount < 1 && (<div className="start-game-message">
            Cần ít nhất 1 người chơi để bắt đầu
        </div>)}
    </div>);
};

StartGameButton.propTypes = {
    onStartGame: PropTypes.func.isRequired,
    allPlayersReady: PropTypes.bool.isRequired,
    playersCount: PropTypes.number.isRequired
};

export default StartGameButton;
