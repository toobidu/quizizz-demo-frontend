import React from 'react';
import { FiBookOpen, FiHelpCircle, FiUsers, FiSettings } from 'react-icons/fi';

const RoomInfoGrid = ({ roomInfo, topics, maxPlayers }) => {
  const getTopicName = (topicId) => {
    if (!topicId) return 'Tổng hợp';
    const topic = topics.find(t => t.id === topicId.toString());
    return topic ? topic.name : 'Tổng hợp';
  };

  return (
    <div className="room-info-grid">
      <div className="info-card">
        <FiBookOpen className="info-icon" />
        <div className="info-content">
          <div className="info-label">Chủ đề</div>
          <div className="info-value">{getTopicName(roomInfo.topic || roomInfo.Topic)}</div>
        </div>
      </div>

      <div className="info-card">
        <FiHelpCircle className="info-icon" />
        <div className="info-content">
          <div className="info-label">Số câu hỏi</div>
          <div className="info-value">{roomInfo.questionCount || roomInfo.QuestionCount || 10}</div>
        </div>
      </div>

      <div className="info-card">
        <FiUsers className="info-icon" />
        <div className="info-content">
          <div className="info-label">Người chơi</div>
          <div className="info-value">{roomInfo.playerCount || roomInfo.PlayerCount || 0}/{maxPlayers}</div>
        </div>
      </div>

      <div className="info-card">
        <FiSettings className="info-icon" />
        <div className="info-content">
          <div className="info-label">Trạng thái</div>
          <div className="info-value status-waiting">Đang chờ</div>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoGrid;