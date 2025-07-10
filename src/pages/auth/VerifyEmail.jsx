import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import { FaBrain } from "react-icons/fa6";
import Background from "../../components/Background";
import '../../style/pages/auth/VerifyEmail.css';

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('[VerifyEmail] Component mounted with email:', email);
        if (!email) {
            console.log('[VerifyEmail] No email found, redirecting to forgot-password');
            navigate('/forgot-password');
            return;
        }

        console.log('[VerifyEmail] Starting 3 second timer before navigating to verify-otp');
        // Wait for 3 seconds then navigate to OTP verification
        const timer = setTimeout(() => {
            console.log('[VerifyEmail] Timer completed, navigating to verify-otp');
            setIsLoading(false);
            navigate('/verify-otp', { state: { email } });
        }, 3000);

        return () => clearTimeout(timer);
    }, [email, navigate]);

    if (!email) return null;

    return (
        <div className="verify-email-container">
            <Background />

            <div className="verify-email-card">
                <div className="verify-email-header">
                    <div className="verify-email-logo">
                        <div className="logo-icon">
                            <FaBrain size={40} color="#dd797a" />
                        </div>
                        <span className="logo-text">BrainGame</span>
                    </div>
                    <div className="email-icon">
                        <FaEnvelope size={60} color="#667eea" />
                    </div>
                    <h1 className="verify-email-title">Đang gửi mã xác thực</h1>
                </div>

                <div className="loading-content">
                    <div className="loading-spinner-large">
                        <FaSpinner size={40} color="#667eea" />
                    </div>
                    <p className="loading-text">
                        Hệ thống đang gửi mã OTP về email <strong>{email}</strong>
                    </p>
                    <p className="loading-subtext">
                        Vui lòng kiểm tra hộp thư của bạn...
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;