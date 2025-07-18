import apiInstance from './apiInstance';
import Cookies from 'js-cookie';
import axios from 'axios';

const profileApi = {
  // Lấy thông tin profile của user hiện tại
  getMyProfile: async () => {
    try {
      // Sử dụng cả localStorage và Cookies để đảm bảo lấy được token
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      console.log('Token being used:', token ? 'Token exists' : 'No token');
      
      // Kiểm tra token trước khi gọi API
      if (!token) {
        console.error('No access token found');
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
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
      console.log('Profile API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile API error details:', error.response?.data || error.message);
      console.error('Profile API error status:', error.response?.status);
      return { Status: error.response?.status || 500, Message: error.response?.data?.message || 'Lỗi khi tải thông tin profile' };
    }
  },

  // Tìm kiếm user theo username
  searchUser: async (username) => {
    try {
      const response = await apiInstance.get(`/profile/search/${username}`);
      console.log('Search user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Search user error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const response = await apiInstance.put('/profile/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật thông tin profile
  updateProfile: async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      
      // Sử dụng cả localStorage và Cookies để đảm bảo lấy được token
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      
      if (!token) {
        console.error('No access token found for update');
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      // Log chi tiết token và headers
      console.log('Token for update:', token.substring(0, 10) + '...');
      console.log('Request headers:', {
        'Authorization': 'Bearer ' + token.substring(0, 10) + '...',
        'Content-Type': 'application/json'
      });
      
      // Thử với cấu trúc dữ liệu khác
      const requestData = {
        userId: null, // Backend có thể lấy từ token
        fullName: profileData.FullName,
        phoneNumber: profileData.PhoneNumber,
        address: profileData.Address,
        email: profileData.Email
      };
      
      console.log('Sending with restructured data:', requestData);
      
      // Sử dụng apiInstance với endpoint đúng theo backend
      const response = await apiInstance.put('/profile/update', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error details:', error.response?.data || error.message);
      return { 
        Status: error.response?.status || 500, 
        Message: error.response?.data?.Message || 'Lỗi khi cập nhật thông tin' 
      };
    }
  }
};

export default profileApi;