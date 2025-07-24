import React from 'react';
import {FiBookOpen, FiHelpCircle, FiSettings, FiUsers} from 'react-icons/fi';

const RoomInfoGrid = ({roomInfo, topics, maxPlayers}) => {
    const getTopicName = (topicId) => {
        if (!topicId) return 'Tổng hợp';


        // Chuyển topicId về dạng chuỗi và số để so sánh
        const topicIdStr = String(topicId);
        const topicIdNum = parseInt(topicId, 10);

        // Kiểm tra cả hai định dạng có thể có của topicId
        const topic = topics.find(t => {
            // Lấy ID của topic theo nhiều cách khác nhau
            const tId = t.id || t.Id;
            const tIdStr = String(tId);
            const tIdNum = parseInt(tId, 10);

            // So sánh cả dạng chuỗi và số
            return tIdStr === topicIdStr || tIdNum === topicIdNum;
        });

        // Nếu tìm thấy topic, trả về tên
        if (topic) {
            const topicName = topic.name || topic.Name;
            return topicName;
        }

        return `Chủ đề #${topicId}`;
    };

    return (<div className="room-info-grid">
        <div className="info-card">
            <FiBookOpen className="info-icon"/>
            <div className="info-content">
                <div className="info-label">Chủ đề</div>
                <div className="info-value">
                    {getTopicName(// Kiểm tra trong settings trước
                        (roomInfo.settings && (roomInfo.settings.topicId || roomInfo.settings.TopicId)) || (roomInfo.Settings && (roomInfo.Settings.topicId || roomInfo.Settings.TopicId)) || // Sau đó mới kiểm tra trực tiếp trong roomInfo
                        roomInfo.topicId || roomInfo.TopicId || roomInfo.topic || roomInfo.Topic || // Nếu không tìm thấy, trả về null để hiển thị 'Tổng hợp'
                        null)}
                </div>
            </div>
        </div>

        <div className="info-card">
            <FiHelpCircle className="info-icon"/>
            <div className="info-content">
                <div className="info-label">Số câu hỏi</div>
                <div className="info-value">{roomInfo.questionCount || roomInfo.QuestionCount || 10}</div>
            </div>
        </div>

        <div className="info-card">
            <FiUsers className="info-icon"/>
            <div className="info-content">
                <div className="info-label">Người chơi</div>
                <div className="info-value">{roomInfo.playerCount || roomInfo.PlayerCount || 0}/{maxPlayers}</div>
            </div>
        </div>

        <div className="info-card">
            <FiSettings className="info-icon"/>
            <div className="info-content">
                <div className="info-label">Trạng thái</div>
                <div className="info-value status-waiting">Đang chờ</div>
            </div>
        </div>
    </div>);
};

export default RoomInfoGrid;
