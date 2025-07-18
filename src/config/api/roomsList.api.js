import apiInstance from './apiInstance';
import Cookies from 'js-cookie';

// Helper function để decode JWT token và lấy user ID
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const roomsApi = {
  // Lấy danh sách tất cả phòng
  getAllRooms: async () => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      const response = await apiInstance.get('/rooms/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ All rooms response:', response.data);
      
      // Process response
      if (response.data) {
        return {
          Status: response.data.Status || 200,
          Data: response.data.Data || [],
          Message: response.data.Message || 'Success'
        };
      } else {
        return {
          Status: 200,
          Data: [],
          Message: 'Success'
        };
      }
    } catch (error) {
      console.error('Get all rooms error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi tải danh sách phòng' };
    }
  },

  // Lấy danh sách phòng công khai
  getPublicRooms: async () => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      const response = await apiInstance.get('/rooms/public', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get public rooms error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi tải phòng công khai' };
    }
  },

  // Tham gia phòng bằng room code
  joinRoomByCode: async (roomCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      const response = await apiInstance.post(`/rooms/${roomCode}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Join room by code error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi tham gia phòng' };
    }
  },

  // Tham gia phòng công khai
  joinPublicRoom: async (roomCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      console.log('🌐 Joining public room with code:', roomCode);

      const response = await apiInstance.post(`/rooms/${roomCode}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Join public room response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Join public room error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi tham gia phòng' };
    }
  },

  // Lấy thông tin phòng theo mã
  getRoomByCode: async (roomCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      console.log('🔍 Getting room info with code:', roomCode);

      const response = await apiInstance.get(`/rooms/code/${roomCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Room info response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get room info error:', error);
      return {
        Status: error.response?.status || 500,
        Message: error.response?.data?.Message || 'Lỗi khi lấy thông tin phòng'
      };
    }
  },

  // Lấy chi tiết phòng theo roomId
  getRoomDetails: async (roomId) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      console.log('🔍 Getting room details with ID:', roomId);

      const response = await apiInstance.get(`/rooms/${roomId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Room details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get room details error:', error);
      return {
        Status: error.response?.status || 500,
        Message: error.response?.data?.Message || 'Lỗi khi lấy chi tiết phòng'
      };
    }
  },

  // Lấy danh sách người chơi trong phòng (hỗ trợ cả roomId và roomCode)
  getPlayersInRoom: async (roomIdOrCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      console.log('👥 Getting players in room:', roomIdOrCode);

      const response = await apiInstance.get(`/rooms/${roomIdOrCode}/players`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Players in room response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get players error:', error);
      return {
        Status: error.response?.status || 500,
        Message: error.response?.data?.Message || 'Lỗi khi lấy danh sách người chơi'
      };
    }
  },

  // Rời phòng bằng room code
  leaveRoom: async (roomCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      console.log('🚪 Leaving room with code:', roomCode);

      const response = await apiInstance.post(`/rooms/${roomCode}/leave`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Leave room response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Leave room error:', error);
      return {
        Status: error.response?.status || 500,
        Message: error.response?.data?.Message || 'Lỗi khi rời phòng'
      };
    }
  },

  // Xóa phòng (khi host rời phòng)
  deleteRoom: async (roomCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }

      console.log('🗑️ Deleting room:', roomCode);

      const response = await apiInstance.delete(`/rooms/${roomCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Delete room response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete room error:', error);
      return {
        Status: error.response?.status || 500,
        Message: error.response?.data?.Message || 'Lỗi khi xóa phòng'
      };
    }
  }
};

export { getUserIdFromToken };
export default roomsApi;
