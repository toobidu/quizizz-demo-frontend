import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { FaBrain } from "react-icons/fa6";
import authApi from '../../config/api/auth.api';
import Background from "../../components/Background";
import '../../style/pages/auth/VerifyOTP.css';

function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        
        if (otpValue.length !== 6) {
            setError('Vui lòng nhập đầy đủ mã OTP');
            return;
        }

        console.log('[VerifyOTP] Submitting OTP:', otpValue, 'for email:', email);
        setIsSubmitting(true);
        setError('');

        try {
            const response = await authApi.verifyOtp(email, otpValue);
            console.log('[VerifyOTP] API response:', response);
            if (response.Status === 200) {
                console.log('[VerifyOTP] Success, storing OTP and navigating to new-password');
                // Store OTP for reset password step
                sessionStorage.setItem('resetOtp', otpValue);
                navigate('/new-password', { state: { email, verified: true } });
            } else {
                console.log('[VerifyOTP] API error:', response.Message);
                setError(response.Message || 'Mã OTP không chính xác');
            }
        } catch (error) {
            console.error('[VerifyOTP] Exception:', error);
            console.error('[VerifyOTP] Error response:', error.response?.data);
            setError(error.response?.data?.Message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        console.log('[VerifyOTP] Resending OTP for email:', email);
        setError('');
        try {
            const response = await authApi.forgotPassword(email);
            console.log('[VerifyOTP] Resend response:', response);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error('[VerifyOTP] Resend error:', error);
            setError('Không thể gửi lại mã OTP');
        }
    };

    if (!email) return null;

    return (
        <div className="verify-otp-container">
            <Background />

            <div className="verify-otp-card">
                <div className="verify-otp-header">
                    <button onClick={() => navigate('/forgot-password')} className="back-button">
                        <FaArrowLeft size={20} />
                    </button>
                    <div className="verify-otp-logo">
                        <div className="logo-icon">
                            <FaBrain size={40} color="#dd797a" />
                        </div>
                        <span className="logo-text">BrainGame</span>
                    </div>
                    <div className="shield-icon">
                        <FaShieldAlt size={60} color="#667eea" />
                    </div>
                    <h1 className="verify-otp-title">Xác thực OTP</h1>
                    <p className="verify-otp-subtitle">
                        Nhập mã 6 số đã được gửi đến <strong>{email}</strong>
                    </p>
                </div>

                {error && (
                    <div className="verify-otp-error">
                        <FaExclamationTriangle size={20} color="#dc2626" />
                        {error}
                    </div>
                )}

                <form className="verify-otp-form" onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength="1"
                                className={`otp-input ${error ? 'otp-input-error' : ''}`}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isSubmitting}
                            />
                        ))}
                    </div>

                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="loading-spinner"></div>
                                Đang xác thực...
                            </>
                        ) : (
                            'Xác thực'
                        )}
                    </button>
                </form>

                <div className="resend-section">
                    <span>Không nhận được mã?</span>
                    <button type="button" className="resend-button" onClick={handleResend}>
                        Gửi lại
                    </button>
                </div>


            </div>
        </div>
    );
}

export default VerifyOTP;