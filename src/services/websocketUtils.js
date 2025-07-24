/**
 * WebSocket Connection Utility
 *
 * Cung cấp các hàm tiện ích để quản lý kết nối WebSocket
 */

import unifiedWebSocketService from './unifiedWebSocketService';
import { centralizedConnectionManager } from './centralizedConnectionManager.js';

/**
 * Kiểm tra kết nối WebSocket và kết nối nếu cần
 * @returns {boolean} Trạng thái kết nối
 */
export const ensureWebSocketConnection = async () => {
    return await centralizedConnectionManager.ensureConnection();
};

/**
 * Tham gia phòng qua WebSocket với đầy đủ thông tin
 * @param {string} roomCode - Mã phòng
 * @returns {boolean} Thành công hay không
 */
export const joinRoomWithFullInfo = (roomCode) => {
    if (!roomCode) {
        
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
                userId = user.id || user.userId || user.Id || user.userId;
                username = user.username || user.username || user.name || user.Name;
            }
        } catch (error) {
            
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
                
            }
        }

        // Kiểm tra xem có đủ thông tin không
        if (!userId || !username) {
            
            return false;
        }

        // Gửi thông tin đầy đủ qua WebSocket
        unifiedWebSocketService.joinRoom(roomCode, username, userId);
        return true;
    } catch (error) {
        
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
            
        }

        if (!userId) {
            userId = localStorage.getItem('userId') || localStorage.getItem('id');
        }

        if (!username) {
            username = localStorage.getItem('username') || localStorage.getItem('name');
        }

        unifiedWebSocketService.leaveRoom(roomCode, username, userId);
    } catch (error) {
        
    }
};

export default {
    ensureWebSocketConnection, joinRoomWithFullInfo, leaveRoomWithFullInfo
};
