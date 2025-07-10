import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const profileApi = {
  // Lấy thông tin profile của user hiện tại
  getMyProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/profile/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Tìm kiếm user theo username
  searchUser: async (username) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/profile/search/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/profile/password`, passwordData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Cập nhật thông tin profile
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/profile/update`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
};

export default profileApi;