import {useEffect} from 'react';
import unifiedWebSocketService from '../services/unifiedWebSocketService';

/**
 * Hook để lắng nghe WebSocket events
 * @param {string} event - Tên event cần lắng nghe
 * @param {function} callback - Callback function khi event được trigger
 * @param {array} deps - Dependencies array (như useEffect)
 */
export const useWebSocketEvent = (event, callback, deps = []) => {
    useEffect(() => {
        if (!event || !callback) return;

        unifiedWebSocketService.on(event, callback);

        return () => {
            unifiedWebSocketService.off(event, callback);
        };
    }, [event, callback, ...deps]);
};

/**
 * Hook để lắng nghe room players updates
 * @param {string} roomCode - Mã phòng cần theo dõi
 * @param {function} onPlayersUpdate - Callback khi có update players
 */
export const useRoomPlayersUpdates = (roomCode, onPlayersUpdate) => {
    useWebSocketEvent('room-players-updated', (data) => {
        if (data.roomCode === roomCode) {
            onPlayersUpdate(data);
        }
    }, [roomCode]);
};

/**
 * Hook để lắng nghe room creation events
 * @param {function} onRoomCreated - Callback khi có phòng mới được tạo
 */
export const useRoomCreated = (onRoomCreated) => {
    useWebSocketEvent('room-created', onRoomCreated);
};

/**
 * Hook để lắng nghe room deletion events
 * @param {function} onRoomDeleted - Callback khi có phòng bị xóa
 */
export const useRoomDeleted = (onRoomDeleted) => {
    useWebSocketEvent('room-deleted', onRoomDeleted);
};

/**
 * Hook tổng hợp để lắng nghe tất cả room events
 * @param {object} handlers - Object chứa các handler functions
 * @param {string} currentRoomCode - Mã phòng hiện tại (optional)
 */
export const useRoomEvents = (handlers = {}, currentRoomCode = null) => {
    const {
        onPlayersUpdate, onRoomCreated, onRoomDeleted, onHostChanged, onGameStarted, onPlayerJoined, onPlayerLeft
    } = handlers;

    // Listen for players updates
    useWebSocketEvent('room-players-updated', (data) => {
        if (onPlayersUpdate) {
            // Chỉ trigger nếu là phòng hiện tại hoặc không có filter
            if (!currentRoomCode || data.roomCode === currentRoomCode) {
                onPlayersUpdate(data);
            }
        }
    }, [currentRoomCode]);

    // Listen for player joined events
    useWebSocketEvent('player-joined', (data) => {
        if (onPlayerJoined) {
            // Chỉ trigger nếu là phòng hiện tại hoặc không có filter
            if (!currentRoomCode || data.roomCode === currentRoomCode) {
                onPlayerJoined(data);
            }
        }
    }, [currentRoomCode]);

    // Listen for player left events
    useWebSocketEvent('player-left', (data) => {
        if (onPlayerLeft) {
            // Chỉ trigger nếu là phòng hiện tại hoặc không có filter
            if (!currentRoomCode || data.roomCode === currentRoomCode) {
                onPlayerLeft(data);
            }
        }
    }, [currentRoomCode]);

    // Listen for room created
    useWebSocketEvent('room-created', (data) => {
        if (onRoomCreated) {
            onRoomCreated(data);
        }
    });

    // Listen for room deleted
    useWebSocketEvent('room-deleted', (data) => {
        if (onRoomDeleted) {
            onRoomDeleted(data);
        }
    });

    // Listen for host changes (part of players update)
    useWebSocketEvent('room-players-updated', (data) => {
        if (onHostChanged && (!currentRoomCode || data.roomCode === currentRoomCode)) {
            if (data.host) {
                onHostChanged(data.host);
            }
        }
    }, [currentRoomCode]);
};

export default {
    useWebSocketEvent, useRoomPlayersUpdates, useRoomCreated, useRoomDeleted, useRoomEvents
};
