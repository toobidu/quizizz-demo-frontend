import React, { useMemo } from 'react';
import {FiLogOut, FiPlay} from 'react-icons/fi';
import PropTypes from 'prop-types';
import '../../style/pages/room/waitingRoom/ActionButtons.css';

/**
 * Component hiển thị các nút hành động trong phòng chờ - No setTimeout fallback
 * - Host: Có nút bắt đầu và rời phòng
 * - Player: Chỉ có nút rời phòng (mặc định đã sẵn sàng khi vào phòng)
 * - Chỉ dựa vào WebSocket events để chuyển trang
 */
const ActionButtons = React.memo(({
    isHost, players, canStartGame, onStartGame, onLeaveRoom, isStarting = false
}) => {
    // ...existing code...
    // Dynamic button text based on state
    const startButtonText = useMemo(() => {
        if (isStarting) return 'Đang bắt đầu...';
        return canStartGame ? 'Bắt đầu trò chơi' : 'Chờ người chơi tham gia';
    }, [canStartGame, isStarting]);

    const handleStartClick = () => {
        if (isStarting) return; // Prevent multiple clicks
        onStartGame();
    };

    return (
        <div className="action-section">
            {/* Chỉ hiển thị nút bắt đầu khi người dùng thực sự là host */}
            {isHost && (
                <button
                    className={`btn-start ${canStartGame && !isStarting ? 'enabled' : 'disabled'} ${isStarting ? 'loading' : ''}`}
                    onClick={handleStartClick}
                    disabled={!canStartGame || isStarting}
                >
                    <FiPlay className="btn-icon"/>
                    {startButtonText}
                </button>
            )}

            {/* Nút rời phòng cho tất cả */}
            <button className="btn-leave" onClick={onLeaveRoom} disabled={isStarting}>
                <FiLogOut className="btn-icon"/>
                Rời phòng
            </button>
        </div>
    );
});

ActionButtons.displayName = 'ActionButtons';

ActionButtons.propTypes = {
    isHost: PropTypes.bool.isRequired,
    players: PropTypes.array.isRequired,
    canStartGame: PropTypes.bool.isRequired,
    onStartGame: PropTypes.func.isRequired,
    onLeaveRoom: PropTypes.func.isRequired,
    isStarting: PropTypes.bool // New prop for starting state
};

export default ActionButtons;
