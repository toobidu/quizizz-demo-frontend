import {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {FaExclamationTriangle, FaShieldAlt} from 'react-icons/fa';
import {IoArrowBackSharp} from "react-icons/io5";
import {FaBrain} from "react-icons/fa6";
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
    const containerRef = useRef(null);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Handle paste event for the entire OTP container
    const handleContainerPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Check if pasted content is numeric and has appropriate length
        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.split('').slice(0, 6);
            const newOtp = [...otp];

            // Fill available slots with pasted digits
            digits.forEach((digit, index) => {
                if (index < 6) {
                    newOtp[index] = digit;
                }
            });

            setOtp(newOtp);
            setError('');

            // Focus the next empty input or the last input if all filled
            const nextEmptyIndex = newOtp.findIndex(val => val === '');
            if (nextEmptyIndex !== -1) {
                inputRefs.current[nextEmptyIndex]?.focus();
            } else {
                inputRefs.current[5]?.focus();
            }
        }
    };

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

        setIsSubmitting(true);
        setError('');

        try {
            const response = await authApi.verifyOtp(email, otpValue);
            if (response.status === 200) {
                // Store OTP for reset password step
                sessionStorage.setItem('resetOtp', otpValue);
                navigate('/new-password', {state: {email, verified: true}});
            } else {
                setError(response.message || 'Mã OTP không chính xác');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setError('');
        try {
            const response = await authApi.forgotPassword(email);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            
            setError('Không thể gửi lại mã OTP');
        }
    };

    if (!email) return null;

    return (<div className="vo-container">
        <Background/>

        <div className="vo-card">
            <div className="vo-header">
                <a onClick={() => navigate('/forgot-password')} className="vo-back-button" aria-label="Quay lại">
                    <IoArrowBackSharp size={20}/>
                </a>
                <div className="vo-logo">
                    <div className="vo-logo-icon">
                        <FaBrain size={40} color="#dd797a"/>
                    </div>
                    <span className="vo-logo-text">BrainGame</span>
                </div>
                <div className="vo-shield-icon">
                    <FaShieldAlt size={60} color="#667eea"/>
                </div>
                <h1 className="vo-title">Xác thực OTP</h1>
                <p className="vo-subtitle">
                    Nhập mã 6 số đã được gửi đến <strong>{email}</strong>
                </p>
            </div>

            {error && (<div className="vo-error">
                <FaExclamationTriangle size={18}/>
                <span>{error}</span>
            </div>)}

            <form className="vo-form" onSubmit={handleSubmit}>
                <div
                    className="vo-otp-inputs"
                    ref={containerRef}
                    onPaste={handleContainerPaste}
                    tabIndex="0"
                >
                    {otp.map((digit, index) => (<input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        className={`vo-otp-input ${error ? 'vo-otp-input-error' : ''}`}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isSubmitting}
                    />))}
                </div>

                <button
                    className={`vo-submit-button ${isSubmitting ? 'loading' : ''}`}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (<>
                        <div className="vo-loading-spinner-container">
                            <div className="vo-loading-spinner"></div>
                        </div>
                        <span className="vo-button-text">Đang xác thực...</span>
                    </>) : (<span>Xác thực</span>)}
                </button>
            </form>

            <div className="vo-resend-section">
                <span>Không nhận được mã?</span>
                <button type="button" className="vo-resend-button" onClick={handleResend}>
                    Gửi lại
                </button>
            </div>
        </div>
    </div>);
}

export default VerifyOTP;
