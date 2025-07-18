import React from 'react';
import { FiPlay, FiCheck, FiClock, FiLogOut } from 'react-icons/fi';

const ActionButtons = ({ 
  isHost, 
  isReady, 
  canStartGame, 
  players, 
  onStartGame, 
  onReady, 
  onLeaveRoom 
}) => {
  return (
    <div className="action-section">
      {isHost ? (
        <button
          className={`btn-start ${canStartGame ? 'enabled' : 'disabled'}`}
          onClick={onStartGame}
          disabled={!canStartGame}
        >
          <FiPlay className="btn-icon" />
          {canStartGame ? 'Bắt đầu trò chơi' :
            players.length < 2 ? 'Chờ thêm người chơi' : 'Chờ tất cả sẵn sàng'}
        </button>
      ) : (
        <button
          className={`btn-ready ${isReady ? 'ready' : 'not-ready'}`}
          onClick={onReady}
        >
          {isReady ? (
            <>
              <FiCheck className="btn-icon" />
              Hủy sẵn sàng
            </>
          ) : (
            <>
              <FiClock className="btn-icon" />
              Sẵn sàng
            </>
          )}
        </button>
      )}

      <button className="btn-leave" onClick={onLeaveRoom}>
        <FiLogOut className="btn-icon" />
        Rời phòng
      </button>
    </div>
  );
};

export default ActionButtons;