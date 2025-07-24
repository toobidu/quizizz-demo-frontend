import {useEffect} from 'react';
import eventEmitter from '../../services/eventEmitter';

const WebSocketHandler = ({
                              roomCode, players, onPlayerJoined, onPlayersUpdated
                          }) => {
    // Lắng nghe sự kiện trực tiếp từ eventEmitter
    useEffect(() => {
        // Check WebSocket connection status
        import('../../services/websocketService').then(({default: websocketService}) => {
        });

        // Theo dõi thời gian cập nhật gần nhất để tránh cập nhật quá nhiều
        let lastUpdateTime = 0;
        const updateThrottleMs = 2000; // Giới hạn cập nhật mỗi 2 giây

        // Xử lý sự kiện player-joined
        const handlePlayerJoined = (playerData) => {
            // Kiểm tra xem dữ liệu có thuộc về phòng hiện tại không
            const dataRoomCode = playerData.roomCode;
            
            if (dataRoomCode && dataRoomCode !== roomCode) {
                return;
            }

            // Lấy userId từ dữ liệu người chơi
            const userId = playerData.userId;
            
            if (!userId) {
                return;
            }

            // Kiểm tra xem người chơi đã có trong danh sách chưa
            const currentPlayerIds = players.map(p => p.userId).filter(Boolean);

            if (!currentPlayerIds.includes(userId)) {
                // Chuẩn hóa dữ liệu người chơi
                const normalizedPlayer = {
                    userId: userId,
                    username: playerData.username || 'Unknown',
                    isHost: playerData.isHost || false,
                    score: playerData.score || 0,
                    isReady: playerData.isReady || false,
                    joinTime: playerData.joinTime || new Date().toISOString()
                };

                // Gọi callback để thêm người chơi mới
                onPlayerJoined(normalizedPlayer);

                // Yêu cầu cập nhật danh sách người chơi, nhưng giới hạn tần suất
                const now = Date.now();
                if (now - lastUpdateTime > updateThrottleMs) {
                    lastUpdateTime = now;
                    setTimeout(() => {
                        import('../../services/websocketService').then(({default: websocketService}) => {
                            websocketService.send('request-players-update', {roomCode});
                        });
                    }, 500); // Trì hoãn 500ms để tránh gửi quá nhiều yêu cầu
                }
            }
        };

        // Xử lý sự kiện player-left
        const handlePlayerLeft = (playerData) => {
            // Kiểm tra xem dữ liệu có thuộc về phòng hiện tại không
            if (playerData.roomCode && playerData.roomCode !== roomCode) {
                return;
            }

            // Lấy userId từ dữ liệu người chơi
            const userId = playerData.userId;
            if (!userId) {
                return;
            }

            // Cập nhật danh sách người chơi bằng cách loại bỏ người chơi đã rời đi
            const updatedPlayers = players.filter(p => {
                const playerId = p.userId;
                return playerId !== userId;
            });

            // Gọi callback để cập nhật danh sách người chơi
            onPlayersUpdated(updatedPlayers);

            // Cập nhật thời gian cập nhật gần nhất
            lastUpdateTime = Date.now();
        };

        // Xử lý sự kiện room-players-updated
        const handleRoomPlayersUpdated = (data) => {
            // FIX: Xử lý trường hợp data có thể undefined hoặc có cấu trúc khác nhau
            if (!data) {
                
                return;
            }
            
            // Extract roomCode từ nhiều nguồn có thể
            const dataRoomCode = data.roomCode || data.RoomCode;
            
            if (dataRoomCode && dataRoomCode !== roomCode) {
                return;
            }

            // Kiểm tra thời gian giới hạn để tránh cập nhật quá nhiều
            const now = Date.now();
            if (now - lastUpdateTime < 1000) { // Giới hạn cập nhật mỗi 1 giây
                return;
            }

            // Lấy danh sách người chơi từ dữ liệu với nhiều cách possible
            let newPlayers = [];
            // Thử các trường hợp khác nhau
            if (data.players && Array.isArray(data.players)) {
                newPlayers = data.players;
            } else if (Array.isArray(data)) {
                // Trường hợp data trực tiếp là mảng người chơi
                newPlayers = data;
            } else {
                return;
            }
            
            // Kiểm tra xem danh sách có thay đổi không
            if (newPlayers.length === players.length) {
                // Nếu số lượng người chơi không thay đổi, kiểm tra xem có sự thay đổi về người chơi không
                const currentIds = new Set(players.map(p => p.userId || p.id || p.Id));
                const newIds = new Set(newPlayers.map(p => p.userId || p.id || p.Id));

                // Kiểm tra xem có người chơi mới không
                let hasChanges = false;
                for (const id of newIds) {
                    if (!currentIds.has(id)) {
                        hasChanges = true;
                        break;
                    }
                }

                // Nếu không có thay đổi, bỏ qua cập nhật
                if (!hasChanges) {
                    return;
                }
            }

            // Chuẩn hóa dữ liệu người chơi
            const normalizedPlayers = newPlayers.map(player => {
                const normalized = {
                    userId: player.userId || player.id || player.Id,
                    username: player.username || player.userName || player.name || player.Name || 'Unknown',
                    isHost: player.isHost || false,
                    score: player.score || player.Score || 0,
                    isReady: player.isReady || false,
                    joinTime: player.joinTime || new Date().toISOString()
                };
                
                return normalized;
            });
            // Gọi callback để cập nhật danh sách người chơi
            onPlayersUpdated(normalizedPlayers, data.host, data.totalPlayers, data.maxPlayers);

            // Cập nhật thời gian cập nhật gần nhất
            lastUpdateTime = now;
        };

        // Đăng ký lắng nghe sự kiện
        eventEmitter.on('player-joined', handlePlayerJoined);
        eventEmitter.on('player-left', handlePlayerLeft);
        eventEmitter.on('room-players-updated', handleRoomPlayersUpdated);

        // Yêu cầu cập nhật danh sách người chơi khi component mount, nhưng trì hoãn để tránh cập nhật liên tục
        if (roomCode) {
            setTimeout(() => {
                import('../../services/websocketService').then(({default: websocketService}) => {
                    websocketService.send('request-players-update', {roomCode});
                    lastUpdateTime = Date.now();
                });
            }, 1500); // Trì hoãn 1.5 giây để tránh cập nhật liên tục khi mount
        }

        // Cleanup khi component unmount
        return () => {
            eventEmitter.off('player-joined', handlePlayerJoined);
            eventEmitter.off('player-left', handlePlayerLeft);
            eventEmitter.off('room-players-updated', handleRoomPlayersUpdated);
        };
    }, [roomCode, players, onPlayerJoined, onPlayersUpdated]);

    // This component doesn't render anything
    return null;
};

export default WebSocketHandler;
