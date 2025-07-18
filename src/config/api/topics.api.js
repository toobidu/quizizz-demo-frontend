import apiInstance from './apiInstance';
import Cookies from 'js-cookie';

const topicsApi = {
  // Lấy danh sách tất cả topics
  getAllTopics: async () => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      const response = await apiInstance.get('/topics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get all topics error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi tải danh sách chủ đề' };
    }
  },

  // Lấy topic theo ID
  getTopicById: async (topicId) => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (!token) {
        return { Status: 401, Message: 'Không tìm thấy token đăng nhập' };
      }
      
      const response = await apiInstance.get(`/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get topic by id error:', error);
      return { Status: error.response?.status || 500, Message: error.response?.data?.Message || 'Lỗi khi tải thông tin chủ đề' };
    }
  }
};

export default topicsApi;