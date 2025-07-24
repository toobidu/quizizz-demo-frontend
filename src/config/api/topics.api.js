import apiInstance from './apiInstance';
import Cookies from 'js-cookie';

const topicsApi = {
    // Lấy danh sách tất cả topics
    getAllTopics: async () => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get('/topics', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Check if response has the expected structure
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data)) {
                return { data: response.data };
            } else {
                return response.data;
            }
        } catch (error) {

            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách chủ đề'
            };
        }
    },

    // Lấy topic theo ID
    getTopicById: async (topicId) => {
        try {
            const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (!token) {
                return {status: 401, message: 'Không tìm thấy token đăng nhập'};
            }

            const response = await apiInstance.get(`/topics/${topicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            
            return {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Lỗi khi tải thông tin chủ đề'
            };
        }
    }
};

export default topicsApi;
