import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { FaBrain } from "react-icons/fa6";
import authApi from '../../config/api/auth.api';
import Background from "../../components/Background";
import '../../style/pages/auth/NewPassword.css';

function NewPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, verified } = location.state || {};
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!email || !verified) {
            navigate('/forgot-password');
        }
    }, [email, verified, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        console.log('[NewPassword] Submitting password reset for email:', email);
        setIsSubmitting(true);

        try {
            // Get OTP from previous step (we need to store it)
            const otpCode = sessionStorage.getItem('resetOtp') || '123456'; // Fallback for testing
            console.log('[NewPassword] Using OTP:', otpCode);
            
            const response = await authApi.resetPassword(email, otpCode, formData.password);
            console.log('[NewPassword] API response:', response);
            if (response.Status === 200) {
                console.log('[NewPassword] Success, cleaning up and navigating to dashboard');
                // Clean up session storage
                sessionStorage.removeItem('resetOtp');
                localStorage.setItem('passwordReset', 'success');
                navigate('/login');
            } else {
                console.log('[NewPassword] API error:', response.Message);
                setErrors({ password: response.Message || 'Mật khẩu mới không được trùng với mật khẩu cũ' });
            }
        } catch (error) {
            console.error('[NewPassword] Exception:', error);
            console.error('[NewPassword] Error response:', error.response?.data);
            setErrors({ password: error.response?.data?.Message || 'Có lỗi xảy ra, vui lòng thử lại' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!email || !verified) return null;

    return (
        <div className="new-password-container">
            <Background />

            <div className="new-password-card">
                <div className="new-password-header">
                    <button onClick={() => navigate('/verify-otp', { state: { email } })} className="back-button">
                        <FaArrowLeft size={20} />
                    </button>
                    <div className="new-password-logo">
                        <div className="logo-icon">
                            <FaBrain size={40} color="#dd797a" />
                        </div>
                        <span className="logo-text">BrainGame</span>
                    </div>
                    <h1 className="new-password-title">Đặt mật khẩu mới</h1>
                    <p className="new-password-subtitle">Tạo mật khẩu mới cho tài khoản của bạn</p>
                </div>

                <form className="new-password-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="newpassword-label" htmlFor="password">
                            <FaLock size={16} color="#667eea" />
                            Mật khẩu mới
                        </label>
                        <div className="input-wrapper password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`input ${errors.password ? 'input-error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu mới"
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isSubmitting}
                            >
                                {showPassword ? (
                                    <FaEyeSlash size={20} color="#718096" />
                                ) : (
                                    <FaEye size={20} color="#718096" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="error-message">
                                <FaExclamationCircle size={16} color="#dc2626" />
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="newpassword-label" htmlFor="confirmPassword">
                            <FaLock size={16} color="#667eea" />
                            Xác nhận mật khẩu
                        </label>
                        <div className="input-wrapper password-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isSubmitting}
                            >
                                {showConfirmPassword ? (
                                    <FaEyeSlash size={20} color="#718096" />
                                ) : (
                                    <FaEye size={20} color="#718096" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <div className="error-message">
                                <FaExclamationCircle size={16} color="#dc2626" />
                                {errors.confirmPassword}
                            </div>
                        )}
                    </div>

                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="loading-spinner"></div>
                                Đang cập nhật...
                            </>
                        ) : (
                            'Cập nhật mật khẩu'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default NewPassword;