import api from './apiInstance';
import Cookies from 'js-cookie';

const login = async (payload) => {
    const res = await api.post('/auth/login', payload);
    
    // Extract tokens from response data
    const accessToken = res.data.data?.accessToken;
    const refreshToken = res.data.data?.refreshToken;

    // Save tokens to localStorage and cookies
    if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Also save to cookies as backup
        Cookies.set('accessToken', accessToken, {expires: 1}); // 1 day
        Cookies.set('refreshToken', refreshToken, {expires: 7}); // 7 days
    }

    return res.data;
};

const register = (payload) => {
    return api.post('/auth/register', payload);
};

const logout = async () => {
    // Check token from either localStorage or cookies
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    if (!token) return;

    try {
        await api.post('/auth/logout', {token});
    } catch (error) {
        
    }

    // Clear from both localStorage and cookies
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
};

const forgotPassword = async (email) => {
    try {
        const res = await api.post('/forgot-password/send-otp', {Email: email});
        return res.data;
    } catch (error) {
        
        throw error;
    }
};

const verifyOtp = async (email, otpCode) => {
    const payload = {Email: email, OtpCode: otpCode};
    try {
        const res = await api.post('/forgot-password/verify-otp', payload);
        return res.data;
    } catch (error) {

        throw error;
    }
};

const resetPassword = async (email, otpCode, newPassword) => {
    const payload = {
        Email: email, OtpCode: otpCode, NewPassword: newPassword, ConfirmPassword: newPassword
    };
    try {
        const res = await api.post('/forgot-password/reset', payload);
        return res.data;
    } catch (error) {

        throw error;
    }
};

export default {
    login, register, logout, forgotPassword, verifyOtp, resetPassword,
};
