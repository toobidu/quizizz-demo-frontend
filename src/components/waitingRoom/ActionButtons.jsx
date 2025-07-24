import React, { useMemo } from 'react';
import {FiLogOut, FiPlay} from 'react-icons/fi';
import PropTypes from 'prop-types';
import '../../style/pages/room/waitingRoom/ActionButtons.css';

/**
 * Component hiển thị các nút hành động trong phòng chờ - Optimized with React.memo
 * - Host: Có nút bắt đầu và rời phòng
 * - Player: Chỉ có nút rời phòng (mặc định đã sẵn sàng khi vào phòng)
 */
const ActionButtons = React.memo(({
    isHost, players, canStartGame, onStartGame, onLeaveRoom
}) => {
    // Sử dụng canStartGame từ props thay vì tính toán lại
    const startButtonText = canStartGame ? 'Bắt đầu trò chơi' : 'Chờ người chơi tham gia';

    const handleStartClick = () => {
        console.log('🎮 [ACTION_BUTTONS] === START BUTTON CLICKED ===');
        console.log('🎮 [ACTION_BUTTONS] Timestamp:', new Date().toISOString());
        console.log('🎮 [ACTION_BUTTONS] Is host:', isHost);
        console.log('🎮 [ACTION_BUTTONS] Can start game:', canStartGame);
        console.log('🎮 [ACTION_BUTTONS] Players:', players);
        console.log('🎮 [ACTION_BUTTONS] Calling onStartGame...');
        onStartGame();
    };

    return (
        <div className="action-section">
            {/* Chỉ hiển thị nút bắt đầu khi người dùng thực sự là host */}
            {isHost && (
                <button
                    className={`btn-start ${canStartGame ? 'enabled' : 'disabled'}`}
                    onClick={handleStartClick}
                    disabled={!canStartGame}
                >
                    <FiPlay className="btn-icon"/>
                    {startButtonText}
                </button>
            )}

            {/* Nút rời phòng cho tất cả */}
            <button className="btn-leave" onClick={onLeaveRoom}>
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
    onLeaveRoom: PropTypes.func.isRequired
};

export default ActionButtons;
