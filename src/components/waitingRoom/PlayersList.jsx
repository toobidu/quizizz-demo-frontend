import React from 'react';
import { FiUsers, FiCheck, FiClock } from 'react-icons/fi';

const PlayersList = ({ players, newPlayerIds, maxPlayers, host }) => {
  // Format time for display
  const formatJoinTime = (joinTime) => {
    if (!joinTime) return '';
    return new Date(joinTime).toLocaleTimeString();
  };

  const renderPlayerSlots = () => {
    const slots = [];

    // Add existing players
    if (players && players.length > 0) {
      players.forEach((player, index) => {
        const isPlayerHost = player.isHost || player.IsHost;
        const playerName = player.username || player.Username || player.name || player.Name || 'Player';
        const playerReady = player.isReady || player.IsReady || false;
        const playerId = player.userId || player.Id;

        // Check if this player is new
        const isNewPlayer = newPlayerIds.includes(player.userId);

        slots.push(
          <div
            key={playerId || `player-${index}`}
            className={`player-slot filled ${playerReady ? 'ready' : 'not-ready'} ${isNewPlayer ? 'new-player' : ''}`}
          >
            <div className="player-avatar">
              <div className="avatar-circle">
                {playerName.charAt(0).toUpperCase()}
              </div>
              {isPlayerHost && <div className="host-crown">👑</div>}
            </div>
            <div className="player-details">
              <div className="player-name">
                {isPlayerHost && '👑 '}
                {playerName}
              </div>
              <div className={`player-status ${playerReady ? 'ready' : 'not-ready'}`}>
                {playerReady ? (
                  <>
                    <FiCheck className="status-icon" />
                    <span>Sẵn sàng</span>
                  </>
                ) : (
                  <>
                    <FiClock className="status-icon" />
                    <span>Chờ...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      });
    }

    // Add empty slots
    for (let i = players.length; i < maxPlayers; i++) {
      slots.push(
        <div key={`empty-${i}`} className="player-slot empty">
          <div className="empty-avatar">
            <FiUsers className="empty-icon" />
          </div>
          <div className="empty-text">
            <span>Đang chờ người chơi...</span>
          </div>
        </div>
      );
    }

    return slots;
  };

  return (
    <div className="players-section">
      <div className="section-header">
        <h2>
          Người chơi ({players.length}/{maxPlayers})
        </h2>
        {players.length >= 2 && (
          <div className={`ready-status ${players.every(p => p.isReady || p.IsReady) ? 'all-ready' : 'waiting'}`}>
            {players.every(p => p.isReady || p.IsReady) ? (
              <>
                <FiCheck className="status-icon" />
                <span>Tất cả đã sẵn sàng!</span>
              </>
            ) : (
              <>
                <FiClock className="status-icon" />
                <span>Chờ người chơi sẵn sàng...</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Host Information */}
      {host && (
        <div className="host-info">
          <h4>👑 Host: {host.username || host.Username}</h4>
        </div>
      )}

      <div className="players-grid">
        {renderPlayerSlots()}
      </div>
    </div>
  );
};

export default PlayersList;