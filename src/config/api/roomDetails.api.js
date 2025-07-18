import apiClient from './apiInstance';
import Cookies from 'js-cookie';

const roomApi = {
  // Lấy phòng theo mã (thay thế getRoomDetails)
  getRoomByCode: async (roomCode) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      console.log('Getting room by code:', roomCode);
      console.log('Using token:', token ? 'Found' : 'Not found');
      
      const response = await apiClient.get(`/api/rooms/code/${roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Room by code response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get room by code error:', error);
      console.error('Error details:', error.response?.data);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi lấy thông tin phòng' };
    }
  },

  // Lấy danh sách người chơi trong phòng (sử dụng roomId)
  getPlayersInRoom: async (roomId) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      console.log('Getting players for roomId:', roomId);
      const response = await apiClient.get(`/api/rooms/${roomId}/players`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Players response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get players error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi lấy danh sách người chơi' };
    }
  },

  // Rời phòng (sử dụng roomId)
  leaveRoom: async (roomId) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      console.log('Leaving room with id:', roomId);
      const response = await apiClient.delete(`/api/rooms/${roomId}/leave`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Leave room response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Leave room error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi rời phòng' };
    }
  },

  // Bắt đầu game (sử dụng roomId)
  startGame: async (roomId) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      console.log('Starting game for room:', roomId);
      const response = await apiClient.post(`/api/rooms/${roomId}/start`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Start game response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Start game error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi bắt đầu game' };
    }
  },

  // Lấy thông tin chi tiết phòng
  getRoomDetails: async (roomId) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      console.log('Getting room details for roomId:', roomId);
      const response = await apiClient.get(`/api/rooms/${roomId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Room details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get room details error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi lấy thông tin phòng' };
    }
  }
};

export default roomApi;