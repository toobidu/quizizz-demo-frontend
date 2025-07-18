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
      console.log('[PUBLIC ROOM] Tham gia phòng công khai:', roomCode);
      const response = await roomsApi.joinPublicRoom(roomCode);
      
      if (response?.Status === 200) {
        console.log('[PUBLIC ROOM] Tham gia phòng công khai thành công');
        return { success: true, data: response.Data };
      } else {
        console.log('[PUBLIC ROOM] Tham gia phòng công khai thất bại:', response?.Message);
        return { 
          success: false, 
          error: response?.Message || 'Không thể tham gia phòng công khai' 
        };
      }
    } catch (error) {
      console.error('[PUBLIC ROOM] Lỗi tham gia phòng công khai:', error);
      return { 
        success: false, 
        error: 'Lỗi khi tham gia phòng công khai' 
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
      console.log('[PRIVATE ROOM] Tham gia phòng riêng tư:', roomCode);
      const response = await roomsApi.joinRoomByCode(roomCode);
      
      if (response?.Status === 200) {
        console.log('[PRIVATE ROOM] Tham gia phòng riêng tư thành công');
        return { success: true, data: response.Data };
      } else {
        console.log('[PRIVATE ROOM] Tham gia phòng riêng tư thất bại:', response?.Message);
        return { 
          success: false, 
          error: response?.Message || 'Mã phòng không hợp lệ hoặc phòng không tồn tại' 
        };
      }
    } catch (error) {
      console.error('[PRIVATE ROOM] Lỗi tham gia phòng riêng tư:', error);
      return { 
        success: false, 
        error: 'Lỗi khi tham gia phòng riêng tư' 
      };
    }
  }
};

export default roomJoinService;