import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {FaEnvelope, FaExclamationCircle, FaExclamationTriangle} from 'react-icons/fa';
import {IoArrowBackSharp} from "react-icons/io5";
import {FaBrain} from "react-icons/fa6";
import authApi from '../../config/api/auth.api';
import Background from "../../components/Background";
import useDocumentTitle from '../../hooks/useDocumentTitle';
import '../../style/pages/auth/ForgotPassword.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sử dụng hook để đặt title cho trang quên mật khẩu
    useDocumentTitle('Quên mật khẩu');

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

        setIsSubmitting(true);
        setError('');

        try {
            const response = await authApi.forgotPassword(email);
            if (response.status === 200) {
                navigate('/verify-email', {state: {email}});
            } else {
                setError(response.message || 'Email không tồn tại trong hệ thống');
            }
        } catch (error) {

            setError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (<div className="fp-container">
        <Background/>

        <div className="fp-card">
            <Link to="/login" className="fp-back-button" aria-label="Quay lại trang đăng nhập">
                <IoArrowBackSharp size={20} color="white"/>
            </Link>

            <div className="fp-header">
                <div className="fp-logo">
                    <div className="fp-logo-icon">
                        <FaBrain size={40} color="#dd797a"/>
                    </div>
                    <span className="fp-logo-text">BrainGame</span>
                </div>
                <h1 className="fp-title">Quên mật khẩu</h1>
            </div>

            {error && (<div className="fp-error">
                <FaExclamationTriangle size={18}/>
                <span>{error}</span>
            </div>)}

            <form className="fp-form" onSubmit={handleSubmit}>
                <div className="fp-form-group">
                    <label className="fp-form-label" htmlFor="email">
                        <FaEnvelope className="fp-input-icon"/>
                        <span>Email</span>
                    </label>
                    <div className="fp-input-wrapper">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`fp-form-input ${error ? 'fp-input-error' : ''}`}
                            value={email}
                            onChange={handleChange}
                            placeholder="Nhập email của bạn"
                            disabled={isSubmitting}
                            autoComplete="email"
                        />
                        {error && (<div className="fp-error-message">
                            <FaExclamationCircle size={14}/>
                            <span>{error}</span>
                        </div>)}
                    </div>
                </div>

                <button
                    className={`fp-submit-button ${isSubmitting ? 'loading' : ''}`}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (<>
                        <div className="fp-loading-spinner-container">
                            <div className="fp-loading-spinner"></div>
                        </div>
                        <span className="fp-button-text">Đang xử lý...</span>
                    </>) : (<span>Gửi mã xác thực</span>)}
                </button>
            </form>

            <div className="fp-divider">
                <span>hoặc</span>
            </div>

            <div className="fp-login-link">
                <span>Đã nhớ mật khẩu?</span>
                <Link to="/login">Đăng nhập ngay</Link>
            </div>
        </div>
    </div>);
}

export default ForgotPassword;
