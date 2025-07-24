import React from 'react';

const PlayersList = ({players, newPlayerIds, formatJoinTime}) => {
    // Sort players: host first, then by join time or username
    const sortedPlayers = [...players].sort((a, b) => {
        // Always put host first regardless of other factors
        const aIsHost = a.isHost || a.isHost || false;
        const bIsHost = b.isHost || b.isHost || false;

        if (aIsHost && !bIsHost) return -1;
        if (!aIsHost && bIsHost) return 1;

        // If neither is host or both are hosts (shouldn't happen), sort by join time if available
        const aJoinTime = a.joinTime || a.joinTime;
        const bJoinTime = b.joinTime || b.joinTime;

        if (aJoinTime && bJoinTime) {
            return new Date(aJoinTime) - new Date(bJoinTime);
        }

        // Fall back to username sorting if join times aren't available
        const usernameA = a.username || a.username || 'Unknown';
        const usernameB = b.username || b.username || 'Unknown';
        return usernameA.localeCompare(usernameB);
    });

    return (<div className="players-list">
        {players.length === 0 ? (
            <div className="no-players">Chưa có người chơi nào</div>) : (sortedPlayers.map((player, index) => (<div
            key={player.userId || index}
            className={`player-item ${player.isHost ? 'host' : ''} ${newPlayerIds.includes(player.userId) ? 'new-player' : ''}`}
        >
            <div className="player-info">
              <span className="player-name">
                {player.isHost && '👑 '}
                  {player.username}
              </span>
                <span className="player-details">
                {player.joinTime && (<small>Tham gia: {formatJoinTime(player.joinTime)}</small>)}
                    {player.score !== undefined && (<small>Điểm: {player.score}</small>)}
              </span>
            </div>

            {player.isReady !== undefined && (<div className={`ready-status ${player.isReady ? 'ready' : 'not-ready'}`}>
                {player.isReady ? '✅ Sẵn sàng' : '⏳ Chưa sẵn sàng'}
            </div>)}
        </div>)))}
    </div>);
};

export default PlayersList;
