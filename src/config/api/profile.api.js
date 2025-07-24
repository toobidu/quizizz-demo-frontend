import apiInstance from './apiInstance';
import Cookies from 'js-cookie';

const profileApi = {
    // Lấy thông tin profile của user hiện tại
    getMyProfile: async () => {
        try {
            // Sử dụng cả localStorage và Cookies để đảm bảo lấy được token
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');

            // Kiểm tra token trước khi gọi API
            if (!token) {
                
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            // Gọi API đến endpoint /api/profile/me theo backend
            const timestamp = new Date().getTime();
            const response = await apiInstance.get(`/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error) {

            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin profile'
            };
        }
    },

    // Tìm kiếm user theo username
    searchUser: async (username) => {
        try {
            const response = await apiInstance.get(`/profile/search/${username}`);
            return response.data;
        } catch (error) {
            
            throw error;
        }
    },

    // Đổi mật khẩu
    changePassword: async (passwordData) => {
        try {
            const response = await apiInstance.put('/profile/password', passwordData);
            return response.data;
        } catch (error) {
            
            throw error;
        }
    },

    // Cập nhật thông tin profile
    updateProfile: async (profileData) => {
        try {

            // Sử dụng cả localStorage và Cookies để đảm bảo lấy được token
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');

            if (!token) {
                
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            // Sử dụng camelCase theo dữ liệu thực tế từ backend
            const requestData = {
                userId: null, // Backend có thể lấy từ token
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber,
                address: profileData.address,
                email: profileData.email
            };

            // Sử dụng apiInstance với endpoint đúng theo backend
            const response = await apiInstance.put('/profile/update', requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi cập nhật thông tin'
            };
        }
    }
};

export default profileApi;
