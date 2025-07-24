import {useEffect, useState} from 'react';
import unifiedWebSocketService from '../services/unifiedWebSocketService';
import {ensureWebSocketConnection, joinRoomWithFullInfo, leaveRoomWithFullInfo} from '../services/websocketUtils';
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

    // Lắng nghe sự kiện player-joined và các sự kiện game
    useEffect(() => {
        if (!roomCode) return;

        // Theo dõi thời gian cập nhật gần nhất để tránh cập nhật quá nhiều
        let lastUpdateTime = 0;
        const updateThrottleMs = 2000; // Giới hạn cập nhật mỗi 2 giây

        const handlePlayerJoined = (playerData) => {
            setLastEvent({
                type: 'player-joined', data: playerData, timestamp: new Date()
            });

            // Thêm người chơi mới vào danh sách nếu chưa có
            setPlayers(prevPlayers => {
                const existingPlayer = prevPlayers.find(p => p.userId === playerData.userId || p.userId === playerData.userId || p.id === playerData.userId || p.Id === playerData.userId);

                if (!existingPlayer) {

                    setNewPlayerIds(prev => [...prev, playerData.userId]);

                    setTimeout(() => {
                        setNewPlayerIds(prev => prev.filter(id => id !== playerData.userId));
                    }, 3000);

                    return [...prevPlayers, playerData];
                } else {
                    return prevPlayers; // Don't add duplicate
                }
            });

            // Yêu cầu cập nhật đầy đủ danh sách người chơi, nhưng giới hạn tần suất
            const now = Date.now();
            if (now - lastUpdateTime > updateThrottleMs) {
                lastUpdateTime = now;
                setTimeout(() => {
                    unifiedWebSocketService.requestPlayersUpdate(roomCode);
                }, 500); // Trì hoãn 500ms để tránh gửi quá nhiều yêu cầu
            }
        };

        // Lắng nghe sự kiện room-players-updated
        // Implement debounce mechanism
        let lastPlayersUpdateTimestamp = 0;
        const debounceTime = 500; // 500ms debounce time

        const handlePlayersUpdated = (data) => {
            // Implement debounce to prevent duplicate updates
            const now = Date.now();
            if (now - lastPlayersUpdateTimestamp < debounceTime) {
                return;
            }
            lastPlayersUpdateTimestamp = now;


            // Kiểm tra xem dữ liệu có thuộc về phòng hiện tại không
            const dataRoomCode = data.roomCode || data.RoomCode;
            if (dataRoomCode && dataRoomCode !== roomCode) {
                return;
            }

            setLastEvent({
                type: 'room-players-updated', data, timestamp: new Date()
            });

            // Cập nhật danh sách người chơi
            if (data.players && Array.isArray(data.players)) {
                setPlayers(data.players);
                lastUpdateTime = Date.now(); // Cập nhật thời gian cập nhật gần nhất
            } else if (data.players && Array.isArray(data.players)) {
                setPlayers(data.players);
                lastUpdateTime = Date.now(); // Cập nhật thời gian cập nhật gần nhất
            }
        };

        // Xử lý sự kiện trạng thái người chơi thay đổi
        const handlePlayerStatusChanged = (data) => {

            setLastEvent({
                type: 'player-status-changed', data, timestamp: new Date()
            });

            // Cập nhật trạng thái người chơi trong danh sách
            setPlayers(prevPlayers => prevPlayers.map(player => player.userId === data.userId ? {
                ...player, isReady: data.status === 'ready'
            } : player));

            // Phát sự kiện để các component khác có thể lắng nghe
            eventEmitter.emit('player-status-changed', data);
        };

        // Xử lý sự kiện game bắt đầu
        const handleGameStarted = (data) => {

            setLastEvent({
                type: 'game-started', data, timestamp: new Date()
            });

            // Phát sự kiện để các component khác có thể lắng nghe
            eventEmitter.emit('game-started', data);
        };

        // Xử lý sự kiện đếm ngược
        const handleCountdown = (data) => {

            setLastEvent({
                type: 'countdown', data, timestamp: new Date()
            });

            // Phát sự kiện để các component khác có thể lắng nghe
            eventEmitter.emit('countdown', data);
        };

        // Đăng ký lắng nghe sự kiện
        eventEmitter.on('player-joined', handlePlayerJoined);
        eventEmitter.on('room-players-updated', handlePlayersUpdated);
        eventEmitter.on('player-status-changed', handlePlayerStatusChanged);
        eventEmitter.on('game-started', handleGameStarted);
        eventEmitter.on('countdown', handleCountdown);

        // Đăng ký lắng nghe các sự kiện game từ WebSocket
        unifiedWebSocketService.on('player-status-changed', handlePlayerStatusChanged);
        unifiedWebSocketService.on('game-started', handleGameStarted);
        unifiedWebSocketService.on('countdown', handleCountdown);

        // Yêu cầu cập nhật danh sách người chơi khi component mount, nhưng trì hoãn để tránh cập nhật liên tục
        setTimeout(() => {
            unifiedWebSocketService.requestPlayersUpdate(roomCode);
            lastUpdateTime = Date.now();
        }, 1000); // Trì hoãn 1 giây để tránh cập nhật liên tục khi mount

        // Cleanup khi unmount
        return () => {
            eventEmitter.off('player-joined', handlePlayerJoined);
            eventEmitter.off('room-players-updated', handlePlayersUpdated);
            eventEmitter.off('player-status-changed', handlePlayerStatusChanged);
            eventEmitter.off('game-started', handleGameStarted);
            eventEmitter.off('countdown', handleCountdown);

            // Hủy đăng ký lắng nghe các sự kiện game từ WebSocket
            unifiedWebSocketService.off('player-status-changed', handlePlayerStatusChanged);
            unifiedWebSocketService.off('game-started', handleGameStarted);
            unifiedWebSocketService.off('countdown', handleCountdown);
        };
    }, [roomCode]);

    // Hàm để gửi tin nhắn WebSocket
    const sendMessage = (type, data) => {
        if (!isConnected) {
            return false;
        }

        try {
            unifiedWebSocketService.send(type, {...data, roomCode});
            return true;
        } catch (error) {
            return false;
        }
    };

    // Hàm để cập nhật trạng thái sẵn sàng của người chơi
    const toggleReady = (ready) => {
        if (!isConnected || !roomCode) return false;

        try {
            unifiedWebSocketService.send('player-ready', {
                roomCode, ready
            });
            return true;
        } catch (error) {
            return false;
        }
    };

    // Hàm để bắt đầu game (chỉ dành cho host)
    const startGame = () => {
        if (!isConnected || !roomCode) return false;

        try {
            unifiedWebSocketService.send('start-game', {roomCode});
            return true;
        } catch (error) {
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
        leaveRoom: () => leaveRoomWithFullInfo(roomCode),
        toggleReady,
        startGame
    };
};

export default useWebSocketRoom;
