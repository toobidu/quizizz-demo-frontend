import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
    FaEnvelope, FaExclamationCircle, FaExclamationTriangle, FaHome, FaLock, FaPhoneAlt, FaUser
} from 'react-icons/fa';
import {FaBrain} from 'react-icons/fa6';
import authApi from '../../config/api/auth.api';
import '../../style/pages/auth/Register.css';
import Background from '../../components/Background';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', fullName: '', email: '', phoneNumber: '', address: '', password: '', confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({success: false, message: ''});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên người dùng'; else if (formData.username.length < 3) newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';

        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';

        if (!formData.email) newErrors.email = 'Vui lòng nhập email'; else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';

        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';

        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu'; else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await authApi.register({
                username: formData.username,
                full_name: formData.fullName,
                email: formData.email,
                phone_number: formData.phoneNumber,
                address: formData.address,
                password: formData.password,
                confirm_password: formData.confirmPassword
            });

            setSubmitStatus({success: true, message: 'Đăng ký thành công! Đang chuyển hướng...'});
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setSubmitStatus({
                success: false, message: error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (<div className="register-container">
        <Background/>
        <div className="register-card">
            <div className="register-header">
                <div className="register-logo">
                    <div className="logo-icon">
                        <FaBrain size={40} color="#dd797a"/>
                    </div>
                    <span className="logo-text">BrainGame</span>
                </div>
                <h1 className="register-title">Đăng ký</h1>
            </div>

            {submitStatus.message && (
                <div className={`register-error ${submitStatus.success ? 'register-success' : ''}`}>
                    {submitStatus.success ? <span style={{color: '#16a34a', fontWeight: 700}}>✓</span> :
                        <FaExclamationTriangle size={20} color="#dc2626"/>}
                    {submitStatus.message}
                </div>)}

            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="register-label" htmlFor="username">
                        <FaUser size={16} color="#667eea"/>
                        Tên người dùng
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className={`input ${errors.username ? 'input-error' : ''}`}
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nhập tên người dùng"
                        disabled={isSubmitting}
                    />
                    {errors.username && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.username}
                    </div>)}
                </div>
                <div className="form-group">
                    <label className="register-label" htmlFor="fullName">
                        <FaUser size={16} color="#667eea"/>
                        Họ tên
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className={`input ${errors.fullName ? 'input-error' : ''}`}
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ tên"
                        disabled={isSubmitting}
                    />
                    {errors.fullName && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.fullName}
                    </div>)}
                </div>
                <div className="form-group">
                    <label className="register-label" htmlFor="email">
                        <FaEnvelope size={16} color="#667eea"/>
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        disabled={isSubmitting}
                    />
                    {errors.email && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.email}
                    </div>)}
                </div>
                <div className="form-group">
                    <label className="register-label" htmlFor="phoneNumber">
                        <FaPhoneAlt size={16} color="#667eea"/>
                        Số điện thoại
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        disabled={isSubmitting}
                    />
                    {errors.phoneNumber && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.phoneNumber}
                    </div>)}
                </div>
                <div className="form-group">
                    <label className="register-label" htmlFor="address">
                        <FaHome size={16} color="#667eea"/>
                        Địa chỉ
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        className={`input ${errors.address ? 'input-error' : ''}`}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        disabled={isSubmitting}
                    />
                    {errors.address && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.address}
                    </div>)}
                </div>
                <div className="form-group">
                    <label className="register-label" htmlFor="password">
                        <FaLock size={16} color="#667eea"/>
                        Mật khẩu
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={`input ${errors.password ? 'input-error' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        disabled={isSubmitting}
                    />
                    {errors.password && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.password}
                    </div>)}
                </div>
                <div className="form-group">
                    <label className="register-label" htmlFor="confirmPassword">
                        <FaLock size={16} color="#667eea"/>
                        Xác nhận mật khẩu
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        disabled={isSubmitting}
                    />
                    {errors.confirmPassword && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626"/>
                        {errors.confirmPassword}
                    </div>)}
                </div>
                <button className="submit-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (<>
                        <div className="loading-spinner"></div>
                        Đang đăng ký...
                    </>) : (<>Đăng ký</>)}
                </button>
            </form>
            <div className="divider">
                <span>hoặc</span>
            </div>
            <div className="login-link">
                <span>Đã có tài khoản?</span>
                <Link to="/login">Đăng nhập ngay</Link>
            </div>
        </div>
    </div>);
}

export default Register;
