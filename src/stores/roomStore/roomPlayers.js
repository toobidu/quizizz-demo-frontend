import roomsApi from '../../config/api/roomsList.api';

/**
 * Player management functionality
 */
const roomPlayers = (set, get) => ({
  // Load room details including players
  loadRoomDetails: async (roomCode) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Tải chi tiết phòng - Phòng ${roomCode}`);
    set({ loading: true, error: '' });

    try {
      const timestamp2 = new Date().toISOString();
      console.log(`[${timestamp2}] Gọi API getRoomByCode...`);

      // Use roomsApi to get room details
      const roomResponse = await roomsApi.getRoomByCode(roomCode);
      console.log(`[${timestamp2}] Phản hồi từ API phòng:`, roomResponse);

      if (roomResponse.Status === 200) {
        const roomInfo = roomResponse.Data;
        const actualRoomId = roomInfo.id || roomInfo.Id;

        const timestamp3 = new Date().toISOString();
        console.log(`[${timestamp3}] Thông tin phòng:`, roomInfo);
        console.log(`[${timestamp3}] ID phòng: ${actualRoomId}`);

        if (actualRoomId) {
          const timestamp4 = new Date().toISOString();
          console.log(`[${timestamp4}] Gọi API getPlayersInRoom...`);
          const playersResponse = await roomsApi.getPlayersInRoom(actualRoomId);
          console.log(`[${timestamp4}] Phản hồi danh sách người chơi:`, playersResponse);

          if (playersResponse.Status === 200) {
            const currentUserId = get().getCurrentUserId();
            const isCurrentUserHost = roomInfo.ownerId === currentUserId || roomInfo.OwnerId === currentUserId;

            const playersData = playersResponse.Data || [];
            const timestamp5 = new Date().toISOString();
            console.log(`[${timestamp5}] Dữ liệu người chơi thô:`, playersData);
            console.log(`[${timestamp5}] Phòng ${roomCode}: ${playersData.length} người chơi (tải ban đầu)`);
            console.log(`[${timestamp5}] Người dùng hiện tại là chủ phòng: ${isCurrentUserHost}`);
            console.log(`[${timestamp5}] ID người dùng hiện tại: ${currentUserId}`);

            set({
              currentRoom: roomInfo,
              players: playersData,
              isHost: isCurrentUserHost,
              loading: false
            });

            const timestamp6 = new Date().toISOString();
            console.log(`[${timestamp6}] Tải chi tiết phòng thành công`);
          }
        }
      } else {
        const timestamp7 = new Date().toISOString();
        console.log(`[${timestamp7}] Không tìm thấy phòng:`, roomResponse?.Message);
        set({ error: 'Không tìm thấy phòng', loading: false });
      }
    } catch (error) {
      const timestamp8 = new Date().toISOString();
      console.error(`[${timestamp8}] Lỗi tải chi tiết phòng:`, error);
      console.error(`[${timestamp8}] Stack trace:`, error.stack);
      console.error(`[${timestamp8}] Thông báo lỗi:`, error.message);

      const errorMessage = error.message.includes('roomsApi')
        ? 'Lỗi API: roomsApi không được định nghĩa'
        : 'Không thể tải thông tin phòng';

      set({ error: errorMessage, loading: false });
    }
  },

  // Refresh players list
  refreshPlayers: async () => {
    const { currentRoom } = get();
    if (!currentRoom) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [REFRESH] refreshPlayers: Không có phòng hiện tại`);
      return;
    }

    try {
      const actualRoomId = currentRoom.id || currentRoom.Id;
      const roomCode = currentRoom.roomCode || currentRoom.RoomCode;
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [REFRESH PLAYERS] Phòng ${actualRoomId} (${roomCode})`);

      // Get current players list for comparison
      const currentPlayers = get().players;
      const currentPlayerIds = currentPlayers.map(p => p.userId || p.UserId || p.id || p.Id).filter(Boolean);

      const response = await roomsApi.getPlayersInRoom(actualRoomId);
      const timestamp2 = new Date().toISOString();
      console.log(`[${timestamp2}] [API RESPONSE] Phản hồi làm mới người chơi:`, response);

      if (response.Status === 200) {
        const playersData = response.Data || [];
        const timestamp3 = new Date().toISOString();
        console.log(`[${timestamp3}] [PLAYERS DATA] Dữ liệu người chơi cập nhật từ API:`, playersData);
        console.log(`[${timestamp3}] [ROOM STATS] Phòng ${actualRoomId}: ${playersData.length} người chơi (phản hồi API)`);

        // Normalize player data
        const normalizedPlayers = playersData.map(player => ({
          userId: player.userId || player.UserId || player.id || player.Id,
          username: player.username || player.Username || 'Unknown',
          isHost: player.isHost || player.IsHost || false,
          score: player.score || player.Score || 0,
          isReady: player.isReady || player.IsReady || false,
          joinTime: player.joinTime || player.JoinTime || new Date().toISOString()
        }));

        // Check for new players
        const newPlayerIds = normalizedPlayers.map(p => p.userId).filter(Boolean);
        const hasNewPlayers = newPlayerIds.some(id => !currentPlayerIds.includes(id));

        if (hasNewPlayers) {
          const newPlayers = normalizedPlayers.filter(p => !currentPlayerIds.includes(p.userId));
          console.log(`[${timestamp3}] [NEW PLAYERS] Phát hiện ${newPlayers.length} người chơi mới:`,
            newPlayers.map(p => p.username));
        }

        console.log(`[${timestamp3}] [UPDATE] Cập nhật danh sách người chơi: ${normalizedPlayers.length} người`);

        // Update players list
        set({ players: normalizedPlayers });
      }
    } catch (error) {
      const timestamp4 = new Date().toISOString();
      console.error(`[${timestamp4}] [ERROR] Lỗi làm mới người chơi:`, error);
    }
  }
});

export default roomPlayers;