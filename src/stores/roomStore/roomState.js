import roomsApi from '../../config/api/roomsList.api';
import createRoomApi from '../../config/api/createroom.api';
import roomJoinService from '../../services/roomJoinService';

/**
 * Room state and basic room actions
 */
const roomState = (set, get) => ({
  // Room list state
  rooms: [],
  loading: false,
  error: '',

  // Auto refresh state
  autoRefresh: false,
  refreshInterval: null,

  // Current room state
  currentRoom: null,
  players: [],
  isHost: false,

  // Room creation state
  createRoomLoading: false,
  roomCode: '',

  // Load public rooms
  loadPublicRooms: async () => {
    set({ loading: true, error: '' });
    try {
      const response = await roomsApi.getPublicRooms();
      if (response?.Status === 200) {
        set({ rooms: response.Data || [], loading: false });
      } else {
        set({ error: 'Không thể tải danh sách phòng công khai', loading: false });
      }
    } catch (error) {
      set({ error: 'Lỗi khi tải danh sách phòng công khai', loading: false });
    }
  },

  // Load all rooms
  loadRooms: async (silent = false) => {
    if (!silent) set({ loading: true, error: '' });
    try {
      const response = await roomsApi.getAllRooms();
      if (!silent) console.log('Response from getAllRooms:', response);
      if (response?.Status === 200) {
        const newRooms = (response?.Data || []).map(room => ({
          ...room,
          RoomCode: room.IsPrivate ? '******' : room.RoomCode
        }));

        // Only update if there are changes
        const { rooms: currentRooms } = get();
        if (JSON.stringify(newRooms) !== JSON.stringify(currentRooms)) {
          set({ rooms: newRooms, loading: false });
        } else if (!silent) {
          set({ loading: false });
        }
      } else {
        if (!silent) set({ error: 'Không thể tải danh sách phòng', loading: false });
      }
    } catch (error) {
      if (!silent) set({ error: 'Lỗi khi tải danh sách phòng', loading: false });
    }
  },

  // Join room
  joinRoom: async (roomCode, isPublic = false) => {
    console.log('Gọi joinRoom với tham số:', { roomCode, isPublic });
    return isPublic
      ? await roomJoinService.joinPublicRoom(roomCode)
      : await roomJoinService.joinPrivateRoom(roomCode);
  },

  // Create room
  createRoom: async (roomData) => {
    set({ createRoomLoading: true, error: '' });
    try {
      const response = await createRoomApi.createRoom(roomData);
      if (response?.Status === 200) {
        set({
          roomCode: response.Data?.Code || '',
          createRoomLoading: false
        });
        return { success: true, data: response.Data };
      } else {
        set({ error: response?.Message || 'Tạo phòng thất bại', createRoomLoading: false });
        return { success: false, error: response?.Message };
      }
    } catch (error) {
      set({ error: 'Có lỗi xảy ra khi tạo phòng', createRoomLoading: false });
      return { success: false, error: 'Có lỗi xảy ra khi tạo phòng' };
    }
  },

  // Leave room
  leaveRoom: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return { success: false };

    try {
      const roomCode = currentRoom.roomCode || currentRoom.RoomCode;
      const response = await roomsApi.leaveRoom(roomCode);
      if (response.Status === 200) {
        set({ currentRoom: null, players: [], isHost: false });
        return { success: true };
      }
      return { success: false, error: response.Message };
    } catch (error) {
      return { success: false, error: 'Lỗi khi rời phòng' };
    }
  },

  // Start game
  startGame: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return { success: false };

    try {
      const roomCode = currentRoom.roomCode || currentRoom.RoomCode;
      console.log('[GAME START] Bắt đầu game cho phòng:', roomCode);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi khi bắt đầu game' };
    }
  },

  // Auto refresh functions
  startAutoRefresh: () => {
    const { refreshInterval } = get();

    // Stop existing interval before creating a new one
    if (refreshInterval) {
      clearInterval(refreshInterval);
      set({ refreshInterval: null });
    }

    console.log('[ROOM] Bắt đầu tự động làm mới danh sách phòng');
    const interval = setInterval(() => {
      const { loadRooms } = get();
      loadRooms(true); // Silent refresh
    }, 10000); // Refresh every 10 seconds

    set({ autoRefresh: true, refreshInterval: interval });
  },

  stopAutoRefresh: () => {
    const { refreshInterval } = get();
    if (refreshInterval) {
      console.log('[ROOM] Dừng tự động làm mới danh sách phòng');
      clearInterval(refreshInterval);
      set({ autoRefresh: false, refreshInterval: null });
    }
  },

  // Clear functions
  clearRoomCode: () => set({ roomCode: '' }),
  clearError: () => set({ error: '' })
});

export default roomState;