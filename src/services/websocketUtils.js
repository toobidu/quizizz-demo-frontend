/**
 * WebSocket Connection Utility
 *
 * Cung cấp các hàm tiện ích để quản lý kết nối WebSocket
 */

import unifiedWebSocketService from './unifiedWebSocketService';

/**
 * Kiểm tra và hiển thị chi tiết localStorage
 */
const debugLocalStorage = () => {};

/**
 * Lấy user data với validation chi tiết
 */
const getUserData = () => {
    let userId, username;
    let source = 'unknown';
    try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            userId = user.id || user.userId || user.Id;
            username = user.username || user.name || user.Name;
            if (userId && username) {
                source = 'user_object';
            }
        }
    } catch (error) {}
    if (!userId || !username) {
        userId = userId || localStorage.getItem('userId') || localStorage.getItem('id');
        username = username || localStorage.getItem('username') || localStorage.getItem('name');
        if (userId && username) {
            source = 'separate_keys';
        }
    }
    if (!userId || !username) {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userId = userId || payload.userId || payload.sub || payload.id;
                username = username || payload.username || payload.name;
                if (userId && username) {
                    source = 'jwt_token';
                }
            }
        } catch (error) {}
    }
    const finalUserId = userId ? parseInt(userId) : null;
    const finalUsername = username ? username.trim() : null;
    if (!finalUserId || isNaN(finalUserId) || finalUserId <= 0) {
        return { userId: null, username: null, valid: false };
    }
    if (!finalUsername || finalUsername.length === 0) {
        return { userId: null, username: null, valid: false };
    }
    return { userId: finalUserId, username: finalUsername, valid: true, source };
};

/**
 * Setup WebSocket event listeners với detailed logging
 */
const setupWebSocketEventListeners = () => {
    unifiedWebSocketService.on('connected', (data) => {
        const pendingRoom = localStorage.getItem('pendingRoomJoin');
        if (pendingRoom) {
            setTimeout(() => {
                joinRoomWithFullInfo(pendingRoom);
            }, 1000);
        }
    });
    unifiedWebSocketService.on('disconnected', (data) => {});
    unifiedWebSocketService.on('room-joined', (data) => {
        localStorage.removeItem('pendingRoomJoin');
    });
    unifiedWebSocketService.on('room-join-failed', (data) => {});
    unifiedWebSocketService.on('error', (error) => {});
};

/**
 * Kiểm tra kết nối WebSocket và kết nối nếu cần
 * @returns {boolean} Trạng thái kết nối
 */
export const ensureWebSocketConnection = async () => {
    try {
        if (!unifiedWebSocketService._listenersSetup) {
            setupWebSocketEventListeners();
            unifiedWebSocketService._listenersSetup = true;
        }
        if (unifiedWebSocketService.isConnected) {
            return true;
        }
        await unifiedWebSocketService.connect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const isConnected = unifiedWebSocketService.isConnected;
        return isConnected;
    } catch (error) {
        return false;
    }
};

/**
 * Tham gia phòng qua WebSocket với đầy đủ thông tin
 * @param {string} roomCode - Mã phòng
 * @returns {boolean} Thành công hay không
 */
/**
 * Tham gia phòng qua WebSocket với đầy đủ thông tin
 * @param {string} roomCode - Mã phòng
 * @returns {boolean} Thành công hay không
 */
export const joinRoomWithFullInfo = async (roomCode) => {
    if (!roomCode || typeof roomCode !== 'string' || roomCode.trim().length === 0) {
        return false;
    }
    try {
        localStorage.setItem('pendingRoomJoin', roomCode);
        const connected = await ensureWebSocketConnection();
        if (!connected) {
            return false;
        }
        const userIdRaw = localStorage.getItem('userId');
        const userId = userIdRaw ? parseInt(userIdRaw) : null;
        if (isNaN(userId) || !userId || userId <= 0) {
            return false;
        }
        const username = localStorage.getItem('username') || 
                        localStorage.getItem('userName') || 
                        localStorage.getItem('name');
        if (!username || username.trim().length === 0) {
            return false;
        }
        const success = unifiedWebSocketService.joinRoom(roomCode, username.trim(), userId);
        if (success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

/**
 * Rời phòng qua WebSocket với đầy đủ thông tin
 * @param {string} roomCode - Mã phòng
 */
export const leaveRoomWithFullInfo = async (roomCode) => {
    if (!roomCode) {
        return;
    }
    try {
        const userData = getUserData();
        if (userData.valid) {
            unifiedWebSocketService.leaveRoom(roomCode, userData.username, userData.userId);
        } else {
            unifiedWebSocketService.leaveRoom(roomCode);
        }
        localStorage.removeItem('pendingRoomJoin');
    } catch (error) {}
};

/**
 * Debug function để test user data
 */
export const debugUserData = () => {
    const userData = getUserData();
    return userData;
};

/**
 * Quick setup cho testing - Auto-populate valid user data
 */
export const setupTestUser = (userId = 8, username = 'hehehee') => {
    const validUserId = parseInt(userId);
    if (isNaN(validUserId) || validUserId <= 0) {
        return false;
    }
    const validUsername = String(username).trim();
    if (validUsername.length === 0) {
        return false;
    }
    localStorage.setItem('userId', validUserId.toString());
    localStorage.setItem('username', validUsername);
    return validateLocalStorageUserData();
};

/**
 * Validate localStorage user data theo format chính xác
 */
export const validateLocalStorageUserData = () => {
    const userIdRaw = localStorage.getItem('userId');
    const userId = userIdRaw ? parseInt(userIdRaw) : null;
    const username = localStorage.getItem('username');
    const validation = {
        userId: {
            raw: userIdRaw,
            parsed: userId,
            type: typeof userId,
            isNumber: !isNaN(userId),
            isPositive: userId > 0,
            valid: !isNaN(userId) && userId > 0
        },
        username: {
            value: username,
            type: typeof username,
            hasValue: !!username,
            notEmpty: !!(username && username.trim().length > 0),
            valid: !!(username && username.trim().length > 0)
        },
        overall: {
            valid: (!isNaN(userId) && userId > 0) && !!(username && username.trim().length > 0)
        }
    };
    return validation.overall.valid;
};

export default {
    ensureWebSocketConnection, 
    joinRoomWithFullInfo, 
    leaveRoomWithFullInfo,
    debugUserData,
    setupTestUser,
    validateLocalStorageUserData
};
