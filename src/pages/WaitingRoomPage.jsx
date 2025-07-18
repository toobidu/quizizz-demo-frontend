import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomPlayersRealtime from '../components/RoomPlayersRealtime';
import websocketService from '../services/websocketService';
import { ensureWebSocketConnection, joinRoomWithFullInfo, leaveRoomWithFullInfo } from '../services/websocketUtils';
import useRoomStore from '../stores/useRoomStore';
import '../style/pages/WaitingRoom.css';

const WaitingRoomPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    initWebSocket, 
    joinRoomWS, 
    leaveRoomWS,
    loadRoomDetails,
    currentRoom,
    players,
    error
  } = useRoomStore();

  // Kiểm tra kết nối WebSocket và thiết lập kết nối
  useEffect(() => {
    const checkConnection = () => {
      // Sử dụng utility function để đảm bảo kết nối WebSocket
      const connected = ensureWebSocketConnection();
      setIsConnected(connected);
      
      if (!connected) {
        // Nếu utility function không thành công, sử dụng initWebSocket từ store
        console.log('[WAITING ROOM] Initializing WebSocket from store...');
        initWebSocket();
      }
    };
    
    checkConnection();
    
    // Kiểm tra kết nối mỗi 5 giây
    const interval = setInterval(checkConnection, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [initWebSocket]);

  // Join room qua WebSocket khi đã kết nối
  useEffect(() => {
    if (isConnected && roomCode) {
      console.log('[WAITING ROOM] Joining room via WebSocket:', roomCode);
      
      // Join room qua WebSocket với đầy đủ thông tin
      joinRoomWithFullInfo(roomCode);
      
      // Đồng thời gọi joinRoomWS từ store để cập nhật state
      joinRoomWS(roomCode);
    }
    
    // Cleanup khi unmount
    return () => {
      if (roomCode) {
        console.log('[WAITING ROOM] Leaving room via WebSocket:', roomCode);
        leaveRoomWithFullInfo(roomCode);
        leaveRoomWS(roomCode);
      }
    };
  }, [isConnected, roomCode, joinRoomWS, leaveRoomWS]);

  // Tải thông tin phòng
  useEffect(() => {
    if (roomCode) {
      setLoading(true);
      loadRoomDetails(roomCode)
        .then(() => {
          setLoading(false);
        })
        .catch(err => {
          console.error('[WAITING ROOM] Error loading room details:', err);
          setLoading(false);
        });
    }
  }, [roomCode, loadRoomDetails]);

  // Cập nhật roomInfo từ store
  useEffect(() => {
    if (currentRoom) {
      setRoomInfo(currentRoom);
    }
  }, [currentRoom]);

  if (loading) {
    return (
      <div className="waiting-room-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="waiting-room-container">
        <div className="error">
          <h3>Lỗi</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/rooms')}>Quay lại danh sách phòng</button>
        </div>
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="waiting-room-container">
        <div className="error">
          <h3>Không tìm thấy phòng</h3>
          <p>Phòng có thể đã bị xóa hoặc không tồn tại</p>
          <button onClick={() => navigate('/rooms')}>Quay lại danh sách phòng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-room-container">
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
      
      <div className="room-content">
        <RoomPlayersRealtime 
          roomCode={roomCode} 
          initialPlayers={players}
        />
        
        <div className="room-actions">
          <button 
            className="leave-button"
            onClick={() => {
              // Gọi cả hai hàm để đảm bảo rời phòng đầy đủ
              leaveRoomWithFullInfo(roomCode);
              leaveRoomWS(roomCode);
              navigate('/rooms');
            }}
          >
            Rời phòng
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;