import { useState, useEffect } from 'react';
import { ensureWebSocketConnection, joinRoomWithFullInfo, leaveRoomWithFullInfo } from '../../../services/websocketUtils.js';

/**
 * Custom hook để quản lý kết nối WebSocket
 * @param {Object} params - Tham số
 * @param {string} params.roomCode - Mã phòng
 * @param {Function} params.initWebSocket - Hàm khởi tạo WebSocket từ store
 * @param {Function} params.joinRoomWS - Hàm tham gia phòng từ store
 * @param {Function} params.leaveRoomWS - Hàm rời phòng từ store
 * @returns {boolean} Trạng thái kết nối WebSocket
 */
const useWebSocketConnection = ({ roomCode, initWebSocket, joinRoomWS, leaveRoomWS }) => {
  const [isConnected, setIsConnected] = useState(false);

  // Kiểm tra kết nối WebSocket và thiết lập kết nối
  useEffect(() => {
    const checkConnection = () => {
      // Sử dụng utility function để đảm bảo kết nối WebSocket
      const connected = ensureWebSocketConnection();
      setIsConnected(connected);

      if (!connected) {
        // Nếu utility function không thành công, sử dụng initWebSocket từ store
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

      // Join room qua WebSocket với đầy đủ thông tin
      joinRoomWithFullInfo(roomCode);

      // Đồng thời gọi joinRoomWS từ store để cập nhật state
      joinRoomWS(roomCode);
    }

    // Cleanup khi unmount
    return () => {
      if (roomCode) {
        leaveRoomWithFullInfo(roomCode);
        leaveRoomWS(roomCode);
      }
    };
  }, [isConnected, roomCode, joinRoomWS, leaveRoomWS]);

  return isConnected;
};

export default useWebSocketConnection;
