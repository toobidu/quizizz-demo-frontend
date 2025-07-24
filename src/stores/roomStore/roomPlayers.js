import roomsApi from '../../config/api/roomsList.api';

/**
 * Player management functionality
 */
const roomPlayers = (set, get) => ({
    // Load room details including players
    loadRoomDetails: async (roomCode) => {
        set({loading: true, error: ''});

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
                        
                        // So sánh cả string và number
                        const ownerId = roomInfo.OwnerId || roomInfo.ownerId || roomInfo.hostId || roomInfo.HostId;
                        
                        const isCurrentUserHost = ownerId && (
                            ownerId == currentUserId ||  // So sánh loose (==) để handle cả string/number
                            ownerId?.toString() === currentUserId?.toString()
                        );

                        const playersData = playersResponse.data || [];

                        // Normalize players data - API có thể thiếu isHost và isReady
                        const normalizedPlayers = playersData.map(player => {
                            const normalizedPlayer = {
                                userId: player.userId || player.id || player.Id,
                                username: player.username || 'Unknown',
                                isHost: player.isHost || false,
                                score: player.score || player.Score || 0,
                                isReady: true, // Mặc định ready khi tham gia phòng
                                joinTime: player.joinTime || new Date().toISOString()
                            };
                            
                            // Kiểm tra xem player có phải là host không bằng cách so sánh với ownerId
                            if (ownerId && (
                                normalizedPlayer.userId == ownerId ||
                                normalizedPlayer.userId?.toString() === ownerId?.toString()
                            )) {
                                normalizedPlayer.isHost = true;
                            }
                            
                            return normalizedPlayer;
                        });

                        set({
                            currentRoom: roomInfo, 
                            players: normalizedPlayers, 
                            isHost: isCurrentUserHost, 
                            loading: false
                        });
                    }
                }
            } else {
                set({error: 'Không tìm thấy phòng', loading: false});
            }
        } catch (error) {

            const errorMessage = error.message.includes('roomsApi') ? 'Lỗi API: roomsApi không được định nghĩa' : 'Không thể tải thông tin phòng';

            set({error: errorMessage, loading: false});
        }
    },

    // Refresh players list
    refreshPlayers: async () => {
        const {currentRoom} = get();
        if (!currentRoom) {
            return;
        }

        try {
            const actualRoomId = currentRoom.id || currentRoom.Id;
            const roomCode = currentRoom.roomCode || currentRoom.RoomCode;

            // Get current players list for comparison
            const currentPlayers = get().players;
            const currentPlayerIds = currentPlayers.map(p => p.userId || p.id || p.Id).filter(Boolean);

            const response = await roomsApi.getPlayersInRoom(actualRoomId);

            if (response.status === 200) {
                const playersData = response.data || [];

                // Normalize player data
                const normalizedPlayers = playersData.map(player => ({
                    userId: player.userId || player.id || player.Id,
                    username: player.username || 'Unknown',
                    isHost: player.isHost || false,
                    score: player.score || player.Score || 0,
                    isReady: true, // Mặc định ready khi tham gia phòng
                    joinTime: player.joinTime || new Date().toISOString()
                }));

                // Check for new players
                const newPlayerIds = normalizedPlayers.map(p => p.userId).filter(Boolean);
                const hasNewPlayers = newPlayerIds.some(id => !currentPlayerIds.includes(id));

                if (hasNewPlayers) {
                    const newPlayers = normalizedPlayers.filter(p => !currentPlayerIds.includes(p.userId));
                }

                // Update players list
                set({players: normalizedPlayers});
            }
        } catch (error) {
            
        }
    }
});

export default roomPlayers;
