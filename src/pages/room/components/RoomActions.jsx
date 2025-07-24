import React from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveRoomWithFullInfo } from '../../../services/websocketUtils.js';
import useRoomStore from '../../../stores/useRoomStore.js';
import { FiPlay, FiLogOut } from 'react-icons/fi';

/**
 * Component chứa các action buttons trong phòng chờ
 * @param {Object} props - Component props
 * @param {string} props.roomCode - Mã phòng
 * @param {Function} props.leaveRoomWS - Hàm rời phòng từ store
 */
const RoomActions = ({ roomCode, leaveRoomWS }) => {
  const navigate = useNavigate();
  const { isHost, players, startGameWS } = useRoomStore();

  // Đếm số người chơi (không tính host)
  const nonHostPlayers = players?.filter(player => !player.isHost) || [];
  const totalPlayers = nonHostPlayers.length;

  // Kiểm tra xem có thể bắt đầu game không
  const canStart = true;

  const handleLeaveRoom = () => {
    // Gọi cả hai hàm để đảm bảo rời phòng đầy đủ
    leaveRoomWithFullInfo(roomCode);
    leaveRoomWS(roomCode);
    navigate('/rooms');
  };

  const handleStartGame = () => {
    if (canStart) {
      startGameWS(roomCode);
    }
  };

  // Hiển thị thông báo trạng thái phù hợp
  const getStartButtonText = () => {
    if (canStart) return 'Bắt đầu trò chơi';
    return 'Chờ người chơi tham gia';
  };

  return (
    <div className="room-actions">
      {/* Host có nút bắt đầu khi có người chơi tham gia */}
      {isHost && (
        <button
          className={`start-button ${canStart ? 'enabled' : 'disabled'}`}
          onClick={handleStartGame}
          disabled={!canStart}
        >
          <FiPlay className="btn-icon" />
          {getStartButtonText()}
        </button>
      )}

      {/* Nút rời phòng cho tất cả */}
      <button
        className="leave-button"
        onClick={handleLeaveRoom}
      >
        <FiLogOut className="btn-icon" />
        Rời phòng
      </button>
    </div>
  );
};

export default RoomActions;
