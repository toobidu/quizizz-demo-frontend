import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {FaExclamationCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock} from 'react-icons/fa';
import {IoArrowBackSharp} from "react-icons/io5";
import {FaBrain} from "react-icons/fa6";
import authApi from '../../config/api/auth.api';
import Background from "../../components/Background";
import '../../style/pages/auth/NewPassword.css';

function NewPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const {email, verified} = location.state || {};
    const [formData, setFormData] = useState({password: '', confirmPassword: ''});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email || !verified) {
            navigate('/forgot-password');
        }
    }, [email, verified, navigate]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
        if (error) setError('');
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

        setIsSubmitting(true);
        setError('');

        try {
            // Get OTP from previous step (we need to store it)
            const otpCode = sessionStorage.getItem('resetOtp') || '123456'; // Fallback for testing

            const response = await authApi.resetPassword(email, otpCode, formData.password);
            if (response.status === 200) {
                // Clean up session storage
                sessionStorage.removeItem('resetOtp');
                localStorage.setItem('passwordReset', 'success');
                navigate('/login');
            } else {
                setError(response.message || 'Mật khẩu mới không được trùng với mật khẩu cũ');
            }
        } catch (error) {

            setError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!email || !verified) return null;

    return (<div className="new-password-container">
        <Background/>

        <div className="new-password-card">
            <a onClick={() => navigate('/verify-otp', {state: {email}})} className="back-button"
               aria-label="Quay lại">
                <IoArrowBackSharp size={20}/>
            </a>

            <div className="new-password-header">
                <div className="new-password-logo">
                    <div className="logo-icon">
                        <FaBrain size={40} color="#dd797a"/>
                    </div>
                    <span className="logo-text">BrainGame</span>
                </div>
                <h1 className="new-password-title">Đặt mật khẩu mới</h1>
                <p className="new-password-subtitle">Tạo mật khẩu mới cho tài khoản của bạn</p>
            </div>

            {error && (<div className="new-password-error">
                <FaExclamationTriangle size={18}/>
                <span>{error}</span>
            </div>)}

            <form className="new-password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="password">
                        <FaLock className="input-icon"/>
                        <span>Mật khẩu mới</span>
                    </label>
                    <div className="input-wrapper password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            className={`form-input ${errors.password ? 'input-error' : ''}`}
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
                            {showPassword ? (<FaEyeSlash size={20} color="#718096"/>) : (
                                <FaEye size={20} color="#718096"/>)}
                        </button>
                    </div>
                    {errors.password && (<div className="error-message">
                        <FaExclamationCircle size={14}/>
                        <span>{errors.password}</span>
                    </div>)}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                        <FaLock className="input-icon"/>
                        <span>Xác nhận mật khẩu</span>
                    </label>
                    <div className="input-wrapper password-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
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
                            {showConfirmPassword ? (<FaEyeSlash size={20} color="#718096"/>) : (
                                <FaEye size={20} color="#718096"/>)}
                        </button>
                    </div>
                    {errors.confirmPassword && (<div className="error-message">
                        <FaExclamationCircle size={14}/>
                        <span>{errors.confirmPassword}</span>
                    </div>)}
                </div>

                <button
                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (<>
                        <div className="loading-spinner-container">
                            <div className="loading-spinner"></div>
                        </div>
                        <span className="button-text">Đang cập nhật...</span>
                    </>) : (<span>Cập nhật mật khẩu</span>)}
                </button>
            </form>
        </div>
    </div>);
}

export default NewPassword;
