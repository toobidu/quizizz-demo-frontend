import React from 'react';
import {useNavigate} from 'react-router-dom';
import {FiLogOut} from 'react-icons/fi';
import useRoomStore from '../../stores/useRoomStore';
import '../../style/components/LeaveRoomButton.css';

const LeaveRoomButton = ({roomCode, onLeaveRoom}) => {
    const navigate = useNavigate();
    const {leaveRoomWS} = useRoomStore();

    const handleLeaveRoom = () => {
        // Nếu có onLeaveRoom từ props, sử dụng nó
        if (onLeaveRoom) {
            onLeaveRoom();
            return;
        }

        // Nếu không có onLeaveRoom, sử dụng logic mặc định
        if (!roomCode) return;

        // 1. Send socket.emit('leaveRoom') to server
        leaveRoomWS(roomCode);

        // 2. Clear local state
        localStorage.removeItem('currentRoomCode');
        localStorage.removeItem('needsRejoin');

        // 3. Navigate back to lobby
        navigate('/lobby');
    };

    return (<button
        className="leave-room-btn"
        onClick={handleLeaveRoom}
        aria-label="Leave Room"
    >
        <FiLogOut className="btn-icon"/>
        <span>Rời phòng</span>
    </button>);
};

export default LeaveRoomButton;
