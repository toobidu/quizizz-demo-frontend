import React from 'react';
import { useParams } from 'react-router-dom';
import useRoomStore from '../../stores/useRoomStore.js';
import useWebSocketConnection from './hooks/useWebSocketConnection.js';
import useRoomData from './hooks/useRoomData.js';
import LoadingScreen from './components/LoadingScreen.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';
import RoomHeader from './components/RoomHeader.jsx';
import RoomContent from './components/RoomContent.jsx';
import '../../style/pages/room/WaitingRoom.css';

/**
 * Component trang phòng chờ
 */
const WaitingRoomPage = () => {
  const { roomCode } = useParams();
  
  const {
    initWebSocket,
    joinRoomWS,
    leaveRoomWS,
    loadRoomDetails,
    currentRoom,
    players,
    error: storeError
  } = useRoomStore();

  // Sử dụng custom hook để quản lý kết nối WebSocket
  const isConnected = useWebSocketConnection({
    roomCode,
    initWebSocket,
    joinRoomWS,
    leaveRoomWS
  });

  // Sử dụng custom hook để quản lý dữ liệu phòng
  const { roomInfo, loading, error: dataError } = useRoomData({
    roomCode,
    loadRoomDetails,
    currentRoom
  });

  // Hiển thị màn hình loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Hiển thị lỗi từ store nếu có
  if (storeError) {
    return <ErrorScreen message={storeError} />;
  }

  // Hiển thị lỗi từ data nếu có
  if (dataError) {
    return <ErrorScreen message={dataError} />;
  }

  // Hiển thị thông báo nếu không tìm thấy phòng
  if (!roomInfo) {
    return (
      <ErrorScreen 
        title="Không tìm thấy phòng" 
        message="Phòng có thể đã bị xóa hoặc không tồn tại" 
      />
    );
  }

  // Hiển thị nội dung phòng chờ
  return (
    <div className="waiting-room-container">
      <RoomHeader 
        roomInfo={roomInfo} 
        roomCode={roomCode} 
        isConnected={isConnected} 
      />
      
      <RoomContent 
        roomCode={roomCode} 
        players={players} 
        leaveRoomWS={leaveRoomWS} 
      />
    </div>
  );
};

export default WaitingRoomPage;