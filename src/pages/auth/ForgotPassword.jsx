import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaExclamationCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { FaBrain } from "react-icons/fa6";
import authApi from '../../config/api/auth.api';
import Background from "../../components/Background";
import '../../style/pages/auth/ForgotPassword.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    const validate = () => {
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email không hợp lệ');
            return false;
        }
        setError(''); // Clear validation error if valid
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        console.log('[ForgotPassword] Submitting email:', email);
        setIsSubmitting(true);
        setError('');

        try {
            const response = await authApi.forgotPassword(email);
            console.log('[ForgotPassword] API response:', response);
            if (response.Status === 200) {
                console.log('[ForgotPassword] Success, navigating to verify-email');
                navigate('/verify-email', { state: { email } });
            } else {
                console.log('[ForgotPassword] API error:', response.Message);
                setError(response.Message || 'Email không tồn tại trong hệ thống');
            }
        } catch (error) {
            console.error('[ForgotPassword] Exception:', error);
            console.error('[ForgotPassword] Error response:', error.response?.data);
            setError(error.response?.data?.Message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <Background />

            <div className="forgot-password-card">
                <div className="forgot-password-header">
                    <Link to="/login" className="back-button">
                        <FaArrowLeft size={20} />
                    </Link>
                    <div className="forgot-password-logo">
                        <div className="logo-icon">
                            <FaBrain size={40} color="#dd797a" />
                        </div>
                        <span className="logo-text">BrainGame</span>
                    </div>
                    <h1 className="forgot-password-title">Quên mật khẩu</h1>
                </div>

                {error && (
                    <div className="forgot-password-error">
                        <FaExclamationTriangle size={20} color="#dc2626" />
                        {error}
                    </div>
                )}

                <form className="forgot-password-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label" htmlFor="email">
                            <FaEnvelope size={16} color="#667eea" />
                            Email đã đăng ký
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`input ${error ? 'input-error' : ''}`}
                                value={email}
                                onChange={handleChange}
                                placeholder="Nhập email của bạn"
                                disabled={isSubmitting}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="loading-spinner"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            'Gửi mã xác thực'
                        )}
                    </button>
                </form>

                <div className="login-link">
                    <span>Nhớ mật khẩu?</span>
                    <Link to="/login">Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
