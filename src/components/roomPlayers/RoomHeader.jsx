import React from 'react';

const RoomHeader = ({ totalPlayers, maxPlayers, lastUpdate, isConnected }) => {
  return (
    <div className="players-header">
      <h3>
        Người chơi ({totalPlayers}/{maxPlayers})
        {lastUpdate && (
          <span className="last-update">
            • Cập nhật lúc: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </h3>
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Kết nối' : '🔴 Mất kết nối'}
      </div>
    </div>
  );
};

export default RoomHeader;