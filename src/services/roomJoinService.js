import roomsApi from '../config/api/roomsList.api';

/**
 * Dịch vụ xử lý các hoạt động tham gia phòng
 */
const roomJoinService = {
    /**
     * Tham gia phòng công khai trực tiếp
     * @param {string} roomCode - Mã phòng để tham gia
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    joinPublicRoom: async (roomCode) => {
        try {
            const response = await roomsApi.joinPublicRoom(roomCode);

            if (response?.status === 200) {
                return {success: true, data: response.data};
            } else {
                return {
                    success: false, error: response?.message || 'Không thể tham gia phòng công khai'
                };
            }
        } catch (error) {
            
            return {
                success: false, error: 'Lỗi khi tham gia phòng công khai'
            };
        }
    },

    /**
     * Tham gia phòng riêng tư bằng cách nhập mã phòng thủ công
     * @param {string} roomCode - Mã phòng để tham gia
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    joinPrivateRoom: async (roomCode) => {
        try {
            const response = await roomsApi.joinRoomByCode(roomCode);

            if (response?.status === 200) {
                return {success: true, data: response.data};
            } else {
                return {
                    success: false, error: response?.message || 'Mã phòng không hợp lệ hoặc phòng không tồn tại'
                };
            }
        } catch (error) {
            
            return {
                success: false, error: 'Lỗi khi tham gia phòng riêng tư'
            };
        }
    }
};

export default roomJoinService;
