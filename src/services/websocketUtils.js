/**
 * WebSocket Connection Utility
 * 
 * Cung cấp các hàm tiện ích để quản lý kết nối WebSocket
 */

import websocketService from './websocketService';

/**
 * Kiểm tra kết nối WebSocket và kết nối nếu cần
 * @returns {boolean} Trạng thái kết nối
 */
export const ensureWebSocketConnection = () => {
  const isConnected = websocketService.isConnected;
  
  if (!isConnected) {
    console.log('[WebSocket] Connecting to WebSocket...');
    websocketService.connect();
  }
  
  return isConnected;
};

/**
 * Tham gia phòng qua WebSocket với đầy đủ thông tin
 * @param {string} roomCode - Mã phòng
 * @returns {boolean} Thành công hay không
 */
export const joinRoomWithFullInfo = (roomCode) => {
  if (!roomCode) {
    console.error('[WebSocket] Missing roomCode for joinRoomWithFullInfo');
    return false;
  }
  
  try {
    // Đảm bảo đã kết nối WebSocket
    ensureWebSocketConnection();
    
    // Lấy thông tin người dùng hiện tại
    let userId, username;
    
    // Thử lấy từ localStorage.user (object)
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        userId = user.id || user.userId || user.Id || user.UserId;
        username = user.username || user.Username || user.name || user.Name;
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing user from localStorage:', error);
    }
    
    // Nếu không có, thử lấy từ các key riêng lẻ
    if (!userId) {
      userId = localStorage.getItem('userId') || localStorage.getItem('id');
    }
    
    if (!username) {
      username = localStorage.getItem('username') || localStorage.getItem('name');
    }
    
    // Nếu vẫn không có, thử lấy từ token JWT
    if (!userId || !username) {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = userId || payload.userId || payload.sub || payload.id;
          username = username || payload.username || payload.name;
        }
      } catch (error) {
        console.error('[WebSocket] Error extracting user info from token:', error);
      }
    }
    
    // Kiểm tra xem có đủ thông tin không
    if (!userId || !username) {
      console.error('[WebSocket] Missing user info for joinRoomWithFullInfo');
      return false;
    }
    
    // Gửi thông tin đầy đủ qua WebSocket
    console.log(`[WebSocket] Joining room ${roomCode} with user ${username} (${userId})`);
    websocketService.joinRoom(roomCode, username, userId);
    return true;
  } catch (error) {
    console.error('[WebSocket] Error in joinRoomWithFullInfo:', error);
    return false;
  }
};

/**
 * Rời phòng qua WebSocket với đầy đủ thông tin
 * @param {string} roomCode - Mã phòng
 */
export const leaveRoomWithFullInfo = (roomCode) => {
  if (!roomCode) return;
  
  try {
    // Lấy thông tin người dùng hiện tại
    let userId, username;
    
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        userId = user.id || user.userId;
        username = user.username || user.name;
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing user from localStorage:', error);
    }
    
    if (!userId) {
      userId = localStorage.getItem('userId') || localStorage.getItem('id');
    }
    
    if (!username) {
      username = localStorage.getItem('username') || localStorage.getItem('name');
    }
    
    console.log(`[WebSocket] Leaving room ${roomCode}`);
    websocketService.leaveRoom(roomCode, username, userId);
  } catch (error) {
    console.error('[WebSocket] Error in leaveRoomWithFullInfo:', error);
  }
};

export default {
  ensureWebSocketConnection,
  joinRoomWithFullInfo,
  leaveRoomWithFullInfo
};