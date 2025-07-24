import React from 'react';
import RoomPlayersRealtime from '../../../components/RoomPlayersRealtime.jsx';
import RoomActions from './RoomActions.jsx';

/**
 * Component hiển thị nội dung chính của phòng chờ
 * @param {Object} props - Component props
 * @param {string} props.roomCode - Mã phòng
 * @param {Array} props.players - Danh sách người chơi
 * @param {Function} props.leaveRoomWS - Hàm rời phòng từ store
 */
const RoomContent = ({ roomCode, players, leaveRoomWS }) => {
  return (
    <div className="room-content">
      <RoomPlayersRealtime
        roomCode={roomCode}
        initialPlayers={players}
      />
      
      <RoomActions 
        roomCode={roomCode}
        leaveRoomWS={leaveRoomWS}
      />
    </div>
  );
};

export default RoomContent;