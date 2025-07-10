import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import authApi from '../../config/api/auth.api';
import '../../style/pages/auth/Login.css';
import {FaBrain} from "react-icons/fa6";
import Background from "../../components/Background";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || loginError) {
            setErrors(prev => ({ ...prev, [name]: '' }));
            setLoginError('');
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setLoginError('');

        try {
            const response = await authApi.login({
                username: formData.username,
                password: formData.password
            });

            const accessToken = response.Data?.AccessToken;
            const refreshToken = response.Data?.RefreshToken;

            if (accessToken && refreshToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('username', formData.username);
                navigate('/dashboard');
                window.location.reload();
            } else {
                setLoginError("Đăng nhập thất bại: Không nhận được token");
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error.response?.data?.Message || 'Sai tên đăng nhập hoặc mật khẩu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="login-container">
            <Background />

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <div className="logo-icon">
                            <FaBrain size={40} color="#dd797a" />
                        </div>
                        <span className="logo-text">BrainGame</span>
                    </div>
                    <h1 className="login-title">Đăng nhập</h1>
                </div>

                {loginError && (
                    <div className="login-error">
                        <FaExclamationTriangle size={20} color="#dc2626" />
                        {loginError}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="login-label" htmlFor="username">
                            <FaUser size={16} color="#667eea" />
                            Tên đăng nhập
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={`input ${errors.username ? 'input-error' : ''}`}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập hoặc email"
                                disabled={isSubmitting}
                                autoComplete="username"
                            />
                        </div>
                        {errors.username && (
                            <div className="error-message">
                                <FaExclamationCircle size={16} color="#dc2626" />
                                {errors.username}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="login-label" htmlFor="password">
                            <FaLock size={16} color="#667eea" />
                            Mật khẩu
                        </label>
                        <div className="input-wrapper password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`input ${errors.password ? 'input-error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                disabled={isSubmitting}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                disabled={isSubmitting}
                            >
                                {showPassword ? (
                                    <FaEyeSlash size={20} color="#718096" />
                                ) : (
                                    <FaEye size={20} color="#718096" />
                                )}
                            </button>
                        </div>
                        <div className="forgot-password">
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                        {errors.password && (
                            <div className="error-message">
                                <FaExclamationCircle size={16} color="#dc2626" />
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="loading-spinner"></div>
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                Đăng nhập
                            </>
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>hoặc</span>
                </div>

                <div className="register-link">
                    <span>Chưa có tài khoản? </span>
                    <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
