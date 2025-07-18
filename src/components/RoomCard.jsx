import React from 'react';
import '../style/components/RoomCard.css';

const RoomCard = ({ room, onJoinPublic }) => {
  const canJoinDirectly = !room.IsPrivate && room.Status === 'waiting';
  
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'waiting': return 'Chờ người chơi';
      case 'playing': return 'Đang chơi';
      case 'ended': return 'Đã kết thúc';
      case 'full': return 'Đã đầy';
      default: return 'Chờ người chơi';
    }
  };

  const getJoinButtonText = () => {
    if (room.IsPrivate) return 'Không thể tham gia';
    if (room.Status === 'ended') return 'Đã kết thúc';
    if (room.Status === 'playing') return 'Đang chơi';
    if (room.PlayerCount >= room.MaxPlayers) return 'Đã đầy';
    return 'Tham gia';
  };

  return (
    <div className={`room-card ${room.IsPrivate ? 'private' : 'public'}`}>
      <div className="room-header">
        <h3>{room.RoomName || `Phòng #${room.Id}`}</h3>
        <span className={`status ${room.Status?.toLowerCase() || 'waiting'}`}>
          {getStatusText(room.Status)}
        </span>
      </div>
      
      <div className="room-info">
        <p><strong>Người chơi:</strong> {room.PlayerCount || 0}/{room.MaxPlayers || 2}</p>
        <p><strong>Chủ đề:</strong> {room.TopicName || 'Kiến thức chung'}</p>
        <p><strong>Số câu hỏi:</strong> {room.QuestionCount || 10}</p>
        
        {/* Chỉ hiển thị room code cho phòng public */}
        {!room.IsPrivate ? (
          <p><strong>Mã phòng:</strong> <span className="room-code">{room.RoomCode}</span></p>
        ) : (
          <p><strong>Mã phòng:</strong> <span className="room-code-hidden">******</span></p>
        )}
      </div>
      
      {/* Nút tham gia */}
      <button 
        className={`btn-join ${canJoinDirectly ? 'enabled' : 'disabled'}`}
        disabled={!canJoinDirectly}
        onClick={() => canJoinDirectly && onJoinPublic(room.RoomCode)}
      >
        {getJoinButtonText()}
      </button>
      
      {/* Badge cho phòng private */}
      {room.IsPrivate && (
        <div className="private-badge">
          🔒 Phòng riêng tư
        </div>
      )}
    </div>
  );
};

export default RoomCard;