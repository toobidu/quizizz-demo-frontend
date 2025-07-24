import { useEffect, useRef } from 'react';
import eventEmitter from '../../services/eventEmitter';
import playerCountLogger from '../../utils/playerCountLogger';

const WebSocketHandler = ({ roomCode, players, onPlayerJoined, onPlayersUpdated }) => {
    const lastUpdateTimeRef = useRef(0);
    const playersRef = useRef(players);

    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    useEffect(() => {
        const updateThrottleMs = 2000; // Chỉ cho phép update mỗi 2s

        // Xử lý khi người chơi mới tham gia
        const handlePlayerJoined = (playerData) => {
            const dataRoomCode = playerData.roomCode;
            if (dataRoomCode && dataRoomCode !== roomCode) return;

            const userId = playerData.userId;
            if (!userId) return;

            const currentPlayerIds = playersRef.current.map(p => p.userId).filter(Boolean);
            if (currentPlayerIds.includes(userId)) return;

            const normalizedPlayer = {
                userId,
                username: playerData.username || 'Unknown',
                isHost: playerData.isHost || false,
                score: playerData.score || 0,
                isReady: playerData.isReady || false,
                joinTime: playerData.joinTime || new Date().toISOString()
            };

            onPlayerJoined(normalizedPlayer);
            playerCountLogger.logPlayerCount(roomCode, playersRef.current.length + 1, 'join');

            const now = Date.now();
            if (now - lastUpdateTimeRef.current > updateThrottleMs) {
                lastUpdateTimeRef.current = now;
                setTimeout(() => {
                    import('../../services/websocketService').then(({ default: websocketService }) => {
                        websocketService.send('request-players-update', { roomCode });
                    });
                }, 500);
            }
        };

        // Xử lý khi người chơi rời khỏi phòng
        const handlePlayerLeft = (playerData) => {
            if (playerData.roomCode && playerData.roomCode !== roomCode) return;

            const userId = playerData.userId;
            if (!userId) return;

            const updatedPlayers = playersRef.current.filter(p => p.userId !== userId);
            onPlayersUpdated(updatedPlayers);
            playerCountLogger.logPlayerCount(roomCode, updatedPlayers.length, 'leave');
            lastUpdateTimeRef.current = Date.now();
        };

        // Cập nhật danh sách người chơi toàn phòng
        const handleRoomPlayersUpdated = (data) => {
            if (!data) return;

            const dataRoomCode = data.roomCode || data.RoomCode;
            if (dataRoomCode && dataRoomCode !== roomCode) return;

            const now = Date.now();
            if (now - lastUpdateTimeRef.current < 1000) return;

            let newPlayers = [];
            if (Array.isArray(data.players)) {
                newPlayers = data.players;
            } else if (Array.isArray(data)) {
                newPlayers = data;
            } else {
                return;
            }

            const currentIds = new Set(playersRef.current.map(p => p.userId || p.id || p.Id));
            const newIds = new Set(newPlayers.map(p => p.userId || p.id || p.Id));

            if (currentIds.size === newIds.size && [...newIds].every(id => currentIds.has(id))) {
                return;
            }

            const normalizedPlayers = newPlayers.map(player => ({
                userId: player.userId || player.id || player.Id,
                username: player.username || player.userName || player.name || player.Name || 'Unknown',
                isHost: player.isHost || false,
                score: player.score || player.Score || 0,
                isReady: player.isReady || false,
                joinTime: player.joinTime || new Date().toISOString()
            }));

            onPlayersUpdated(normalizedPlayers, data.host, data.totalPlayers, data.maxPlayers);
            lastUpdateTimeRef.current = now;
        };

        // Đăng ký listener
        eventEmitter.on('player-joined', handlePlayerJoined);
        eventEmitter.on('player-left', handlePlayerLeft);
        eventEmitter.on('room-players-updated', handleRoomPlayersUpdated);

        // Gửi yêu cầu cập nhật danh sách khi mount
        if (roomCode) {
            setTimeout(() => {
                import('../../services/websocketService').then(({ default: websocketService }) => {
                    websocketService.send('request-players-update', { roomCode });
                    lastUpdateTimeRef.current = Date.now();
                });
            }, 1500);
        }

        // Cleanup khi unmount
        return () => {
            eventEmitter.off('player-joined', handlePlayerJoined);
            eventEmitter.off('player-left', handlePlayerLeft);
            eventEmitter.off('room-players-updated', handleRoomPlayersUpdated);
        };
    }, [roomCode, onPlayerJoined, onPlayersUpdated]);

    return null; // Không render UI
};

export default WebSocketHandler;
