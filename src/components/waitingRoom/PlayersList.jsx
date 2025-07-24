import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaCrown } from 'react-icons/fa';
import useRealtimeUIStore from '../../stores/useRealtimeUIStore';
import '../../style/pages/room/waitingRoom/PlayersList.css';

/**
 * Danh sách người chơi trong phòng chờ - Optimized with React.memo and useMemo
 */
const PlayersList = React.memo(({ players, newPlayerIds, maxPlayers, host, currentUserId }) => {
    // ✅ NEW: Get real-time UI state
    const { isPlayerNew: isPlayerNewFromStore } = useRealtimeUIStore();

    // ✅ FIXED: Đơn giản hóa việc xác định currentUserId
    const currentUserIdStr = useMemo(() => {
        if (currentUserId) {
            return String(currentUserId);
        }
        return '';
    }, [currentUserId]);


    // Memoized player status calculation
    const getPlayerStatus = useMemo(() => (player) => {
        const isHost = player.isHost;

        if (isHost) {
            return { icon: <FaCrown />, text: 'Host', className: 'host-status' };
        }

        // Tất cả người chơi đều được xem là sẵn sàng
        return { icon: <FaCheck />, text: 'Sẵn sàng', className: 'ready-status' };
    }, []);

    // ✅ ENHANCED: Check for new players from both sources
    const isPlayerNew = useMemo(() => (playerId) => {
        return newPlayerIds.includes(playerId) || isPlayerNewFromStore(playerId);
    }, [newPlayerIds, isPlayerNewFromStore]);

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
                    // ✅ FIXED: So sánh chính xác currentUserId
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
                                {isHost && <div className="crown-overlay"><FaCrown /></div>}
                            </div>

                            <div className="player-info">
                                <div className="player-name">
                                    <span className="username">{username}</span>
                                    {/* ✅ FIXED: Hiển thị (Bạn) đúng chỗ */}
                                    {isCurrentUser && (
                                        <span className="current-user-badge">(Bạn)</span>
                                    )}
                                    {/* Enhanced Host badge - more prominent */}
                                    {isHost && (
                                        <span className="host-badge">
                                            <FaCrown className="crown-icon" />
                                            Host
                                        </span>
                                    )}
                                </div>

                                <div className="player-status">
                                    <span className={`status-icon ${status.className}`}>
                                        {status.icon}
                                    </span>
                                    <span className="status-text">{status.text}</span>
                                </div>
                            </div>

                            {isNew && (
                                <div className="new-player-indicator">
                                    <span className="new-badge">Mới</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, index) => (
                    <div key={`empty-${index}`} className="player-card empty-slot">
                        <div className="player-avatar empty">
                            <span className="avatar-text">?</span>
                        </div>
                        <div className="player-info">
                            <div className="player-name">
                                <span className="username">Chờ người chơi...</span>
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
    players: PropTypes.array.isRequired,
    newPlayerIds: PropTypes.array.isRequired,
    maxPlayers: PropTypes.number.isRequired,
    host: PropTypes.object,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default PlayersList;
