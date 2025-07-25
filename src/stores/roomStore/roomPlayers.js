import roomsApi from '../../config/api/roomsList.api';

/**
 * Player management functionality
 */
const roomPlayers = (set, get) => ({
    // Load room details including players
    loadRoomDetails: async (roomCode) => {
        set({ loading: true, error: '' });

        try {
            // Use roomsApi to get room details
            const roomResponse = await roomsApi.getRoomByCode(roomCode);

            if (roomResponse.status === 200) {
                const roomInfo = roomResponse.data;
                const actualRoomId = roomInfo.id || roomInfo.Id;

                if (actualRoomId) {
                    const playersResponse = await roomsApi.getPlayersInRoom(actualRoomId);

                    if (playersResponse.status === 200) {
                        const currentUserId = get().getCurrentUserId();
                        
                        // ✅ FIXED: Lấy ownerId từ roomInfo để xác định host
                        const ownerId = roomInfo.OwnerId || roomInfo.ownerId || roomInfo.hostId || roomInfo.HostId;
                        
                        // ✅ FIXED: Logic xác định isHost chính xác
                        const isCurrentUserHost = ownerId && currentUserId && (
                            ownerId.toString() === currentUserId.toString() ||
                            parseInt(ownerId) === parseInt(currentUserId)
                        );



                        const playersData = playersResponse.data || [];

                        // ✅ FIXED: Normalize players data với logic xác định host đúng
                        const normalizedPlayers = playersData.map(player => {
                            const normalizedPlayer = {
                                userId: player.userId || player.id || player.Id,
                                username: player.username || 'Unknown',
                                isHost: false, // Mặc định false, sẽ được set lại bên dưới
                                score: player.score || player.Score || 0,
                                isReady: true, // Mặc định ready khi tham gia phòng
                                joinTime: player.joinTime || new Date().toISOString()
                            };

                            // ✅ FIXED: Kiểm tra xem player có phải là host không
                            if (ownerId && (
                                normalizedPlayer.userId.toString() === ownerId.toString() ||
                                parseInt(normalizedPlayer.userId) === parseInt(ownerId)
                            )) {
                                normalizedPlayer.isHost = true;
                            }

                            return normalizedPlayer;
                        });
                        
                        // ✅ FIXED: Set state với logic đúng
                        
                        set({
                            currentRoom: roomInfo,
                            players: normalizedPlayers,
                            isHost: isCurrentUserHost, // Chỉ dựa vào roomInfo.ownerId
                            loading: false
                        });
                    }
                }
            } else {
                set({ error: 'Không tìm thấy phòng', loading: false });
            }
        } catch (error) {

            const errorMessage = error.message.includes('roomsApi') ? 'Lỗi API: roomsApi không được định nghĩa' : 'Không thể tải thông tin phòng';

            set({ error: errorMessage, loading: false });
        }
    },

    // ✅ FIXED: Refresh players list với logic host đúng
    refreshPlayers: async () => {
        const { currentRoom } = get();
        if (!currentRoom) {
            return;
        }

        try {
            const actualRoomId = currentRoom.id || currentRoom.Id;
            const currentUserId = get().getCurrentUserId();
            
            // ✅ FIXED: Lấy ownerId để xác định host
            const ownerId = currentRoom.OwnerId || currentRoom.ownerId || currentRoom.hostId || currentRoom.HostId;

            // Get current players list for comparison
            const currentPlayers = get().players;
            const currentPlayerIds = currentPlayers.map(p => p.userId || p.id || p.Id).filter(Boolean);

            const response = await roomsApi.getPlayersInRoom(actualRoomId);

            if (response.status === 200) {
                const playersData = response.data || [];

                // ✅ FIXED: Normalize player data với logic xác định host đúng
                const normalizedPlayers = playersData.map(player => {
                    const normalizedPlayer = {
                        userId: player.userId || player.id || player.Id,
                        username: player.username || 'Unknown',
                        isHost: false, // Mặc định false
                        score: player.score || player.Score || 0,
                        isReady: true, // Mặc định ready khi tham gia phòng
                        joinTime: player.joinTime || new Date().toISOString()
                    };
                    
                    // ✅ FIXED: Kiểm tra xem player có phải là host không
                    if (ownerId && (
                        normalizedPlayer.userId.toString() === ownerId.toString() ||
                        parseInt(normalizedPlayer.userId) === parseInt(ownerId)
                    )) {
                        normalizedPlayer.isHost = true;
                    }
                    
                    return normalizedPlayer;
                });

                // ✅ FIXED: Kiểm tra xem isHost của user hiện tại có thay đổi không
                const isCurrentUserHost = ownerId && currentUserId && (
                    ownerId.toString() === currentUserId.toString() ||
                    parseInt(ownerId) === parseInt(currentUserId)
                );

                // Check for new players
                const newPlayerIds = normalizedPlayers.map(p => p.userId).filter(Boolean);
                const hasNewPlayers = newPlayerIds.some(id => !currentPlayerIds.includes(id));

                if (hasNewPlayers) {
                    const newPlayers = normalizedPlayers.filter(p => !currentPlayerIds.includes(p.userId));
                }

                // ✅ FIXED: Update cả players và isHost
                set({ 
                    players: normalizedPlayers,
                    isHost: isCurrentUserHost
                });
            }
        } catch (error) {
        }
    },

    // ✅ ADD: Direct players update method for real-time WebSocket updates
    setPlayers: (newPlayers) => {
        // Validate input
        if (!Array.isArray(newPlayers)) {
            return;
        }

        const { currentRoom, getCurrentUserId } = get();
        const currentUserId = getCurrentUserId();
        // Normalize players với host logic
        const normalizedPlayers = newPlayers.map(player => {
            const normalizedPlayer = {
                userId: player.userId || player.id || player.Id,
                username: player.username || player.name || 'Unknown',
                isHost: player.isHost || false,
                score: player.score || player.Score || 0,
                isReady: player.isReady !== undefined ? player.isReady : true,
                joinTime: player.joinTime || new Date().toISOString()
            };
            return normalizedPlayer;
        });

        // Update isHost for current user
        const hostPlayer = normalizedPlayers.find(p => p.isHost);
        const isCurrentUserHost = hostPlayer && currentUserId && 
            (hostPlayer.userId.toString() === currentUserId.toString());

        set({ 
            players: normalizedPlayers,
            isHost: isCurrentUserHost
        });
    },

    addPlayer: (newPlayer) => {
        const { players } = get();
        const existingPlayerIndex = players.findIndex(p => 
            p.userId.toString() === newPlayer.userId?.toString()
        );

        if (existingPlayerIndex === -1) {
            // Player doesn't exist, add them
            const normalizedPlayer = {
                userId: newPlayer.userId || newPlayer.id,
                username: newPlayer.username || newPlayer.name || 'Unknown',
                isHost: newPlayer.isHost || false,
                score: newPlayer.score || 0,
                isReady: newPlayer.isReady !== undefined ? newPlayer.isReady : true,
                joinTime: new Date().toISOString()
            };
            const updatedPlayers = [...players, normalizedPlayer];
            get().setPlayers(updatedPlayers);
        } else {
        }
    }
});

export default roomPlayers;
