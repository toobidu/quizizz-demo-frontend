import React from 'react';

/**
 * Component hiển thị phần header của phòng chờ
 * @param {Object} props - Component props
 * @param {Object} props.roomInfo - Thông tin phòng
 * @param {string} props.roomCode - Mã phòng
 * @param {boolean} props.isConnected - Trạng thái kết nối WebSocket
 */
const RoomHeader = ({ roomInfo, roomCode, isConnected }) => {
  return (
    <div className="room-header">
      <h1>{roomInfo.roomName || roomInfo.RoomName || 'Phòng chờ'}</h1>
      <div className="room-code">
        <span>Mã phòng: {roomCode}</span>
        <button
          onClick={() => navigator.clipboard.writeText(roomCode)}
          className="copy-button"
        >
          Sao chép
        </button>
      </div>
      <div className="connection-status">
        WebSocket: {isConnected ? '🟢 Đã kết nối' : '🔴 Chưa kết nối'}
      </div>
    </div>
  );
};

export default RoomHeader;