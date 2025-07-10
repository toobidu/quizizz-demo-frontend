import axios from "axios";
import Cookies from 'js-cookie';

const apiInstance = axios.create({
    baseURL: '/api', // Sẽ proxy qua Vite tới BE: http://localhost:5000
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false // không cần cookie tự động nếu dùng js-cookie thủ công
});

apiInstance.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default apiInstance;
