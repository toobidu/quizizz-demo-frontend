import React from 'react';
import {FaBook, FaLock, FaQuestionCircle, FaUnlock, FaUsers} from 'react-icons/fa';
import {IoBan, IoFlag, IoGameController, IoHourglass} from 'react-icons/io5';
import '../style/components/RoomCard.css';

const RoomCard = ({room, onJoinPublic}) => {

    // Update to match API data format (camelCase)
    const canJoinDirectly = !room.isPrivate && room.status === 'waiting';

    const getRoomCode = () => {
        return room.roomCode || room.RoomCode || room.code || room.Code;
    };

    const roomCode = getRoomCode();

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'waiting':
                return 'Chờ người chơi';
            case 'playing':
                return 'Đang chơi';
            case 'ended':
                return 'Đã kết thúc';
            case 'full':
                return 'Đã đầy';
            default:
                return 'Chờ người chơi';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'waiting':
                return <IoHourglass/>;
            case 'playing':
                return <IoGameController/>;
            case 'ended':
                return <IoFlag/>;
            case 'full':
                return <IoBan/>;
            default:
                return <IoHourglass/>;
        }
    };

    const getJoinButtonText = () => {
        if (room.isPrivate) return 'Không thể tham gia';
        if (room.status === 'ended') return 'Đã kết thúc';
        if (room.status === 'playing') return 'Đang chơi';
        if (room.playerCount >= room.maxPlayers) return 'Đã đầy';
        return 'Tham gia ngay';
    };

    return (<div className={`rc-room-card ${room.isPrivate ? 'private' : 'public'}`}>
        <div className="rc-room-card-inner">
            <div className="rc-room-header">
                <h3>{room.roomName || `Phòng #${room.id}`}</h3>
                <div className={`rc-status-badge ${room.status?.toLowerCase() || 'waiting'}`}>
                    <span className="rc-status-icon">{getStatusIcon(room.status)}</span>
                    <span className="rc-status-text">{getStatusText(room.status)}</span>
                </div>
            </div>

            <div className="rc-room-info">
                <div className="rc-info-item">
                    <FaUsers className="rc-info-icon"/>
                    <span>{room.playerCount || 0}/{room.maxPlayers || 2} người chơi</span>
                </div>

                <div className="rc-info-item">
                    <FaBook className="rc-info-icon"/>
                    <span>{room.topicName || 'Kiến thức chung'}</span>
                </div>

                <div className="rc-info-item">
                    <FaQuestionCircle className="rc-info-icon"/>
                    <span>{room.questionCount || 10} câu hỏi</span>
                </div>

                <div className="rc-info-item">
                    {room.isPrivate ? (<>
                        <FaLock className="rc-info-icon private"/>
                        <span className="rc-room-code-hidden">******</span>
                    </>) : (<>
                        <FaUnlock className="rc-info-icon public"/>
                        <span className="rc-room-code">{roomCode}</span>
                    </>)}
                </div>
            </div>

            <button
                className={`rc-btn-join ${canJoinDirectly ? 'enabled' : 'disabled'}`}
                disabled={!canJoinDirectly}
                onClick={() => canJoinDirectly && onJoinPublic(roomCode)}
            >
                {getJoinButtonText()}
            </button>

            {room.isPrivate && (<div className="rc-private-badge">
                <FaLock/> Phòng riêng tư
            </div>)}
        </div>
    </div>);
};

export default RoomCard;
