import apiClient from './apiInstance';
import Cookies from 'js-cookie';

const roomApi = {
    // Lấy phòng theo mã (thay thế getRoomDetails)
    getRoomByCode: async (roomCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiClient.get(`/api/rooms/code/${roomCode}`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi lấy thông tin phòng'
            };
        }
    },

    // Lấy danh sách người chơi trong phòng (sử dụng roomId)
    getPlayersInRoom: async (roomId) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiClient.get(`/api/rooms/${roomId}/players`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi lấy danh sách người chơi'
            };
        }
    },

    // Rời phòng (sử dụng roomId)
    leaveRoom: async (roomId) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiClient.delete(`/api/rooms/${roomId}/leave`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500, message: error.response?.data?.message || 'Lỗi khi rời phòng'
            };
        }
    },

    // Bắt đầu game (sử dụng roomId)
    startGame: async (roomId) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiClient.post(`/api/rooms/${roomId}/start`, {}, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500, message: error.response?.data?.message || 'Lỗi khi bắt đầu game'
            };
        }
    },

    // Lấy thông tin chi tiết phòng
    getRoomDetails: async (roomId) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiClient.get(`/api/rooms/${roomId}/details`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi lấy thông tin phòng'
            };
        }
    }
};

export default roomApi;
