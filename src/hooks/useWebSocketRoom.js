/**
 * useWebSocketRoom Hook
 * 
 * Custom hook để quản lý kết nối WebSocket cho phòng chơi
 */

import { useEffect, useState } from 'react';
import websocketService from '../services/websocketService';
import { ensureWebSocketConnection, joinRoomWithFullInfo, leaveRoomWithFullInfo } from '../services/websocketUtils';
import eventEmitter from '../services/eventEmitter';

/**
 * Hook để quản lý kết nối WebSocket cho phòng chơi
 * @param {string} roomCode - Mã phòng
 * @returns {object} - Trạng thái và hàm tiện ích
 */
const useWebSocketRoom = (roomCode) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [newPlayerIds, setNewPlayerIds] = useState([]);

  // Kiểm tra và thiết lập kết nối WebSocket
  useEffect(() => {
    if (!roomCode) return;

    // Kiểm tra kết nối ban đầu
    const connected = ensureWebSocketConnection();
    setIsConnected(connected);

    // Kiểm tra kết nối định kỳ
    const interval = setInterval(() => {
      const currentConnected = ensureWebSocketConnection();
      setIsConnected(currentConnected);
    }, 5000);

    // Tham gia phòng khi đã kết nối
    if (connected) {
      joinRoomWithFullInfo(roomCode);
    }

    // Cleanup khi unmount
    return () => {
      clearInterval(interval);
      if (roomCode) {
        leaveRoomWithFullInfo(roomCode);
      }
    };
  }, [roomCode]);

  // Lắng nghe sự kiện player-joined
  useEffect(() => {
    if (!roomCode) return;

    const handlePlayerJoined = (playerData) => {
      console.log('🎮 [useWebSocketRoom] Player joined:', playerData);
      setLastEvent({
        type: 'player-joined',
        data: playerData,
        timestamp: new Date()
      });

      // Thêm người chơi mới vào danh sách nếu chưa có
      setPlayers(prevPlayers => {
        const existingPlayer = prevPlayers.find(p => 
          p.userId === playerData.userId || 
          p.UserId === playerData.userId ||
          p.id === playerData.userId ||
          p.Id === playerData.userId
        );
        
        if (!existingPlayer) {
          console.log('🎮 [useWebSocketRoom] Thêm người chơi mới:', playerData.username);
          
          // Đánh dấu người chơi mới để hiển thị hiệu ứng
          setNewPlayerIds(prev => [...prev, playerData.userId]);
          
          // Tự động xóa hiệu ứng sau 3 giây
          setTimeout(() => {
            setNewPlayerIds(prev => prev.filter(id => id !== playerData.userId));
          }, 3000);
          
          return [...prevPlayers, playerData];
        }
        return prevPlayers;
      });
      
      // Yêu cầu cập nhật đầy đủ danh sách người chơi
      websocketService.requestPlayersUpdate(roomCode);
    };

    // Lắng nghe sự kiện room-players-updated
    const handlePlayersUpdated = (data) => {
      console.log('👥 [useWebSocketRoom] Players updated:', data);
      setLastEvent({
        type: 'room-players-updated',
        data,
        timestamp: new Date()
      });

      if (data.players && Array.isArray(data.players)) {
        console.log('👥 [useWebSocketRoom] Cập nhật danh sách người chơi:', data.players.length, 'người');
        setPlayers(data.players);
      } else if (data.Players && Array.isArray(data.Players)) {
        console.log('👥 [useWebSocketRoom] Cập nhật danh sách người chơi (Players):', data.Players.length, 'người');
        setPlayers(data.Players);
      }
    };

    // Đăng ký lắng nghe sự kiện
    eventEmitter.on('player-joined', handlePlayerJoined);
    eventEmitter.on('room-players-updated', handlePlayersUpdated);
    
    // Yêu cầu cập nhật danh sách người chơi khi component mount
    console.log('🔄 [useWebSocketRoom] Yêu cầu cập nhật danh sách người chơi khi mount');
    websocketService.requestPlayersUpdate(roomCode);

    // Cleanup khi unmount
    return () => {
      eventEmitter.off('player-joined', handlePlayerJoined);
      eventEmitter.off('room-players-updated', handlePlayersUpdated);
    };
  }, [roomCode]);

  // Hàm để gửi tin nhắn WebSocket
  const sendMessage = (type, data) => {
    if (!isConnected) {
      console.warn('[useWebSocketRoom] Cannot send message, not connected');
      return false;
    }

    try {
      websocketService.send(type, { ...data, roomCode });
      return true;
    } catch (error) {
      console.error('[useWebSocketRoom] Error sending message:', error);
      return false;
    }
  };

  return {
    isConnected,
    lastEvent,
    players,
    newPlayerIds,
    sendMessage,
    joinRoom: () => joinRoomWithFullInfo(roomCode),
    leaveRoom: () => leaveRoomWithFullInfo(roomCode)
  };
};

export default useWebSocketRoom;