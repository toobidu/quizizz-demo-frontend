import React from 'react';

const PlayersList = ({ players, newPlayerIds, formatJoinTime }) => {
  return (
    <div className="players-list">
      {players.length === 0 ? (
        <div className="no-players">Chưa có người chơi nào</div>
      ) : (
        players.map((player, index) => (
          <div
            key={player.userId || index}
            className={`player-item ${player.isHost ? 'host' : ''} ${newPlayerIds.includes(player.userId) ? 'new-player' : ''}`}
          >
            <div className="player-info">
              <span className="player-name">
                {player.isHost && '👑 '}
                {player.username}
              </span>
              <span className="player-details">
                {player.joinTime && (
                  <small>Tham gia: {formatJoinTime(player.joinTime)}</small>
                )}
                {player.score !== undefined && (
                  <small>Điểm: {player.score}</small>
                )}
              </span>
            </div>

            {player.isReady !== undefined && (
              <div className={`ready-status ${player.isReady ? 'ready' : 'not-ready'}`}>
                {player.isReady ? '✅ Sẵn sàng' : '⏳ Chưa sẵn sàng'}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PlayersList;