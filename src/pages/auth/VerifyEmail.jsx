import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {FaEnvelope} from 'react-icons/fa';
import {IoArrowBackSharp} from "react-icons/io5";
import {FaBrain} from "react-icons/fa6";
import {ImSpinner8} from "react-icons/im";
import Background from "../../components/Background";
import '../../style/pages/auth/VerifyEmail.css';

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
            return;
        }


        // Progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 3.33; // Roughly 100% in 3 seconds
            });
        }, 100);

        // Wait for 3 seconds then navigate to OTP verification
        const timer = setTimeout(() => {
            setIsLoading(false);
            navigate('/verify-otp', {state: {email}});
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [email, navigate]);

    if (!email) return null;

    return (<div className="verify-email-container">
        <Background/>

        <div className="verify-email-card">
            <a onClick={() => navigate('/forgot-password')} className="back-button" aria-label="Quay lại">
                <IoArrowBackSharp size={20}/>
            </a>

            <div className="verify-email-header">
                <div className="verify-email-logo">
                    <div className="logo-icon">
                        <FaBrain size={40} color="#dd797a"/>
                    </div>
                    <span className="logo-text">BrainGame</span>
                </div>
                <div className="email-icon">
                    <FaEnvelope size={60} color="#667eea"/>
                </div>
                <h1 className="verify-email-title">Đang gửi mã xác thực</h1>
            </div>

            <div className="loading-content">
                <div className="loading-spinner-wrapper">
                    <ImSpinner8 size={40} className="loading-spinner-large"/>
                </div>
                <p className="loading-text">
                    Hệ thống đang gửi mã OTP về email <strong>{email}</strong>
                </p>
                <p className="loading-subtext">
                    Vui lòng kiểm tra hộp thư của bạn...
                </p>

                <div className="progress-bar-container">
                    <div className="progress-bar" style={{width: `${progress}%`}}></div>
                </div>
            </div>
        </div>
    </div>);
}

export default VerifyEmail;
