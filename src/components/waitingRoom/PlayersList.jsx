import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {FaCheck, FaCrown} from 'react-icons/fa';
import '../../style/pages/room/waitingRoom/PlayersList.css';

/**
 * Danh sách người chơi trong phòng chờ - Optimized with React.memo and useMemo
 */
const PlayersList = React.memo(({players, newPlayerIds, maxPlayers, host, currentUserId: propCurrentUserId}) => {
    // Lấy currentUserId từ props hoặc localStorage nếu không có
    const currentUserId = propCurrentUserId || localStorage.getItem('userId');

    // Memoized current user ID calculation
    const currentUserIdStr = useMemo(() => {
        if (currentUserId) {
            return String(currentUserId);
        }

        // Nếu không, lấy từ localStorage
        let userId = localStorage.getItem('userId');
        if (!userId) {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    // Fixed: Remove duplicate payload.userId
                    userId = payload.userId || payload.sub || payload.id || payload.Id;
                }
            } catch (error) {
                
            }
        }
        return String(userId || '');
    }, [currentUserId]);

    // Memoized player status calculation
    const getPlayerStatus = useMemo(() => (player) => {
        const isHost = player.isHost;

        if (isHost) {
            return {icon: <FaCrown/>, text: 'Host', className: 'host-status'};
        }

        // Tất cả người chơi đều được xem là sẵn sàng
        return {icon: <FaCheck/>, text: 'Sẵn sàng', className: 'ready-status'};
    }, []);

    // Memoized check for new players
    const isPlayerNew = useMemo(() => (playerId) => {
        return newPlayerIds.includes(playerId);
    }, [newPlayerIds]);

    if (!players || !Array.isArray(players)) {
        return (
            <div className="players-section">
                <div className="players-header">
                    <h3>Người chơi (0/{maxPlayers || 4})</h3>
                </div>
                <div className="players-list">
                    <div className="loading-players">Đang tải danh sách người chơi...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="players-section">
            <div className="players-header">
                <h3>Người chơi ({players.length}/{maxPlayers})</h3>
            </div>

            <div className="players-list">
                {players.map(player => {
                    const playerId = player.userId;
                    const username = player.username || 'Người chơi';
                    const isCurrentUser = String(playerId) === currentUserIdStr;
                    const isHost = player.isHost;

                    const status = getPlayerStatus(player);
                    const isNew = isPlayerNew(playerId);

                    return (
                        <div
                            key={playerId}
                            className={`player-card ${isHost ? 'host-card' : ''} ${isCurrentUser ? 'current-user' : ''} ${isNew ? 'new-player' : ''}`}
                        >
                            <div className="player-avatar">
                                <span className="avatar-text">
                                    {username.charAt(0).toUpperCase()}
                                </span>
                                {isHost && <div className="crown-overlay"><FaCrown/></div>}
                            </div>

                            <div className="player-info">
                                <div className="player-name">
                                    <span className="username">{username}</span>
                                    {isCurrentUser && (
                                        <span className="current-user-badge">(Bạn)</span>
                                    )}
                                    {/* Enhanced Host badge - more prominent */}
                                    {isHost && (
                                        <span className="host-badge-inline">HOST</span>
                                    )}
                                </div>

                                <div className={`player-status ${status.className}`}>
                                    <span className="status-icon">{status.icon}</span>
                                    <span className="status-text">{status.text}</span>
                                </div>
                            </div>

                            {/* Enhanced Host badge - corner badge */}
                            {isHost && (
                                <div className="host-badge">
                                    <FaCrown />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Empty slots */}
                {Array.from({length: Math.max(0, maxPlayers - players.length)}).map((_, index) => (
                    <div key={`empty-${index}`} className="player-card empty-slot">
                        <div className="player-avatar empty">
                            <span className="avatar-text">+</span>
                        </div>
                        <div className="player-info">
                            <div className="player-name">
                                <span className="username">Đang chờ...</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

PlayersList.displayName = 'PlayersList';

PlayersList.propTypes = {
    players: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        username: PropTypes.string,
        name: PropTypes.string,
        isHost: PropTypes.bool,
        isReady: PropTypes.bool
    })),
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    host: PropTypes.object,
    newPlayerIds: PropTypes.array,
    maxPlayers: PropTypes.number
};

PlayersList.defaultProps = {
    players: [], newPlayerIds: [], maxPlayers: 4
};

export default PlayersList;
