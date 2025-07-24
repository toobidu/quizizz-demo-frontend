import roomsApi from '../../config/api/roomsList.api';
import createRoomApi from '../../config/api/createroom.api';
import roomJoinService from '../../services/roomJoinService';

/**
 * Room state and basic room actions
 */
const roomState = (set, get) => ({
    // Room list state
    rooms: [], loading: false, error: '',

    // Auto refresh state
    autoRefresh: false, refreshInterval: null,

    // Current room state
    currentRoom: null, players: [], isHost: false,

    // Set host status
    setIsHost: (status) => set({isHost: status}),

    // Update players list
    setPlayers: (newPlayers) => {
        set({players: newPlayers});
    },

    // Remove player from list (for real-time updates)
    removePlayer: (userId) => {
        const { players } = get();
        const updatedPlayers = players.filter(player => 
            player.userId !== userId && 
            player.userId?.toString() !== userId?.toString()
        );
        set({players: updatedPlayers});
    },

    // Room creation state
    createRoomLoading: false, roomCode: '',

    // Load public rooms
    loadPublicRooms: async () => {
        set({loading: true, error: ''});
        try {
            const response = await roomsApi.getPublicRooms();
            if (response?.status === 200) {
                set({rooms: response.data || [], loading: false});
            } else {
                set({error: 'Không thể tải danh sách phòng công khai', loading: false});
            }
        } catch (error) {
            set({error: 'Lỗi khi tải danh sách phòng công khai', loading: false});
        }
    },

    // Load all rooms
    loadRooms: async (silent = false) => {
        if (!silent) set({loading: true, error: ''});
        try {
            const response = await roomsApi.getAllRooms();
            if (response?.status === 200) {
                const newRooms = (response?.data || []).map(room => ({
                    ...room, RoomCode: room.IsPrivate ? '******' : room.RoomCode
                }));

                // Only update if there are changes
                const {rooms: currentRooms} = get();
                if (JSON.stringify(newRooms) !== JSON.stringify(currentRooms)) {
                    set({rooms: newRooms, loading: false});
                } else if (!silent) {
                    set({loading: false});
                }
            } else {
                if (!silent) set({error: 'Không thể tải danh sách phòng', loading: false});
            }
        } catch (error) {
            if (!silent) set({error: 'Lỗi khi tải danh sách phòng', loading: false});
        }
    },

    // Join room
    joinRoom: async (roomCode, isPublic = false) => {
        return isPublic ? await roomJoinService.joinPublicRoom(roomCode) : await roomJoinService.joinPrivateRoom(roomCode);
    },

    // Create room
    createRoom: async (roomData) => {
        set({createRoomLoading: true, error: ''});
        try {
            const response = await createRoomApi.createRoom(roomData);
            if (response?.status === 200) {
                set({
                    roomCode: response.data?.Code || '', createRoomLoading: false
                });
                return {success: true, data: response.data};
            } else {
                set({error: response?.message || 'Tạo phòng thất bại', createRoomLoading: false});
                return {success: false, error: response?.message};
            }
        } catch (error) {
            set({error: 'Có lỗi xảy ra khi tạo phòng', createRoomLoading: false});
            return {success: false, error: 'Có lỗi xảy ra khi tạo phòng'};
        }
    },

    // Leave room
    leaveRoom: async () => {
        const {currentRoom} = get();
        if (!currentRoom) return {success: false};

        try {
            const roomCode = currentRoom.roomCode || currentRoom.RoomCode;
            const response = await roomsApi.leaveRoom(roomCode);
            if (response.status === 200) {
                set({currentRoom: null, players: [], isHost: false});
                return {success: true};
            }
            return {success: false, error: response.message};
        } catch (error) {
            return {success: false, error: 'Lỗi khi rời phòng'};
        }
    },

    // Start game
    startGame: async () => {
        const {currentRoom} = get();
        if (!currentRoom) return {success: false};

        try {
            const roomCode = currentRoom.roomCode || currentRoom.RoomCode;
            return {success: true};
        } catch (error) {
            return {success: false, error: 'Lỗi khi bắt đầu game'};
        }
    },

    // Auto refresh functions
    startAutoRefresh: () => {
        const {refreshInterval} = get();

        // Stop existing interval before creating a new one
        if (refreshInterval) {
            clearInterval(refreshInterval);
            set({refreshInterval: null});
        }

        const interval = setInterval(() => {
            const {loadRooms} = get();
            loadRooms(true); // Silent refresh
        }, 10000); // Refresh every 10 seconds

        set({autoRefresh: true, refreshInterval: interval});
    },

    stopAutoRefresh: () => {
        const {refreshInterval} = get();
        if (refreshInterval) {
            clearInterval(refreshInterval);
            set({autoRefresh: false, refreshInterval: null});
        }
    },

    // Clear functions
    clearRoomCode: () => set({roomCode: ''}), clearError: () => set({error: ''})
});

export default roomState;
