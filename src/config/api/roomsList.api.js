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
        
        return null;
    }
};

const roomsApi = {
    // Lấy danh sách tất cả phòng
    getAllRooms: async () => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get('/rooms/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Process response
            if (response.data) {
                return {
                    status: response.data.status || 200,
                    data: response.data.data || [],
                    message: response.data.message || 'Success'
                };
            } else {
                return {
                    status: 200, data: [], message: 'Success'
                };
            }
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách phòng'
            };
        }
    },

    // Lấy danh sách phòng công khai
    getPublicRooms: async () => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get('/rooms/public', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tải phòng công khai'
            };
        }
    },

    // Tham gia phòng bằng room code
    joinRoomByCode: async (roomCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.post(`/rooms/${roomCode}/join`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tham gia phòng'
            };
        }
    },

    // Tham gia phòng công khai
    joinPublicRoom: async (roomCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.post(`/rooms/${roomCode}/join`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tham gia phòng'
            };
        }
    },

    // Lấy thông tin phòng theo mã
    getRoomByCode: async (roomCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get(`/rooms/code/${roomCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi lấy thông tin phòng'
            };
        }
    },

    // Lấy chi tiết phòng theo roomId
    getRoomDetails: async (roomId) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get(`/rooms/${roomId}/details`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi lấy chi tiết phòng'
            };
        }
    },

    // Lấy danh sách người chơi trong phòng (hỗ trợ cả roomId và roomCode)
    getPlayersInRoom: async (roomIdOrCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get(`/rooms/${roomIdOrCode}/players`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi lấy danh sách người chơi'
            };
        }
    },

    // Rời phòng bằng room code
    leaveRoom: async (roomCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.post(`/rooms/${roomCode}/leave`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500, message: error.response?.data?.message || 'Lỗi khi rời phòng'
            };
        }
    },

    // Xóa phòng (khi host rời phòng)
    deleteRoom: async (roomCode) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.delete(`/rooms/${roomCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500, message: error.response?.data?.message || 'Lỗi khi xóa phòng'
            };
        }
    },

    // Bắt đầu game
    startGame: async (roomCode, gameSettings = {}) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.post(`/rooms/${roomCode}/start-game`, gameSettings, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi bắt đầu game'
            };
        }
    }
};

export {getUserIdFromToken};
export default roomsApi;
