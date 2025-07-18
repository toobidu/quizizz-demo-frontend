import api from './apiInstance';
import Cookies from 'js-cookie';

const login = async (payload) => {
    console.log('Login with payload:', payload);
    const res = await api.post('/auth/login', payload);
    console.log('Login response:', res.data);
    const accessToken = res.data.Data?.AccessToken;
    const refreshToken = res.data.Data?.RefreshToken;

    // Lưu vào localStorage và cookie để đảm bảo tính nhất quán
    if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Vẫn giữ lại cookie cho các trường hợp khác có thể sử dụng
        Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 ngày
        Cookies.set('refreshToken', refreshToken, { expires: 7 });
    }

    return res.data;
};

const register = (payload) => {
    console.log(payload);
    return api.post('/auth/register', payload);
};



const logout = async () => {
    // Check token from either localStorage or cookies
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    if (!token) return;

    try {
        await api.post('/auth/logout', { token });
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear from both localStorage and cookies
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
};

const forgotPassword = async (email) => {
    console.log('[AuthAPI] Calling forgotPassword with email:', email);
    try {
        const res = await api.post('/forgot-password/send-otp', { Email: email });
        console.log('[AuthAPI] forgotPassword response:', res.data);
        return res.data;
    } catch (error) {
        console.error('[AuthAPI] forgotPassword error:', error);
        throw error;
    }
};

const verifyOtp = async (email, otpCode) => {
    console.log('[AuthAPI] Calling verifyOtp with email:', email, 'otpCode:', otpCode);
    const payload = { Email: email, OtpCode: otpCode };
    console.log('[AuthAPI] verifyOtp payload:', payload);
    try {
        const res = await api.post('/forgot-password/verify-otp', payload);
        console.log('[AuthAPI] verifyOtp response:', res.data);
        return res.data;
    } catch (error) {
        console.error('[AuthAPI] verifyOtp error:', error);
        console.error('[AuthAPI] verifyOtp error response:', error.response?.data);
        console.error('[AuthAPI] verifyOtp error status:', error.response?.status);
        throw error;
    }
};

const resetPassword = async (email, otpCode, newPassword) => {
    console.log('[AuthAPI] Calling resetPassword with email:', email, 'otpCode:', otpCode, 'newPassword length:', newPassword?.length);
    const payload = {
        Email: email,
        OtpCode: otpCode,
        NewPassword: newPassword,
        ConfirmPassword: newPassword
    };
    console.log('[AuthAPI] resetPassword payload:', payload);
    try {
        const res = await api.post('/forgot-password/reset', payload);
        console.log('[AuthAPI] resetPassword response:', res.data);
        return res.data;
    } catch (error) {
        console.error('[AuthAPI] resetPassword error:', error);
        console.error('[AuthAPI] resetPassword error response:', error.response?.data);
        console.error('[AuthAPI] resetPassword error status:', error.response?.status);
        throw error;
    }
};

export default {
    login,
    register,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
};
