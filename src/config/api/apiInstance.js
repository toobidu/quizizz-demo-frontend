import axios from "axios";
import Cookies from 'js-cookie';
import {API_CONFIG} from '../../constants/api';

/**
 * Axios instance with default configuration
 * Handles authentication headers and request/response interceptors
 */
const apiInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL, timeout: API_CONFIG.TIMEOUT, headers: {
        'Content-Type': 'application/json',
    }, withCredentials: false
});


apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default apiInstance;
