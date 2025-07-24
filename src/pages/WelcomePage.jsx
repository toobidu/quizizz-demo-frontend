import {useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import '../style/pages/WelcomePage.css';
import Footer from "../layouts/Footer.jsx";

function WelcomePage() {
    const navigate = useNavigate();
    const buttonGroupRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (<div className="wp-welcome-page-container">
        {/* Hero Section */}
        <div className="wp-hero-section" id="hero" ref={buttonGroupRef}>
            <div className="wp-hero-content">
                <div className="wp-logo-container">
                    <div className="wp-logo">BrainGame</div>
                    <div className="wp-logo-tagline">Rèn luyện não bộ thông minh</div>
                </div>

                <div className="wp-hero-text">
                    <h1 className="wp-title">Phát triển trí tuệ cùng BrainGame</h1>
                    <p className="wp-subtitle">
                        Nâng cao khả năng tư duy, cải thiện trí nhớ và rèn luyện não bộ mỗi ngày với các bài tập thú
                        vị và hiệu quả
                    </p>
                </div>

                <div className="wp-button-group">
                    <button className="wp-btn primary" onClick={() => navigate('/login')}>Đăng nhập ngay</button>
                    <button className="wp-btn secondary" onClick={() => navigate('/register')}>Tạo tài khoản
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="wp-hero-decoration">
                <div className="wp-floating-shape wp-shape-1"></div>
                <div className="wp-floating-shape wp-shape-2"></div>
                <div className="wp-floating-shape wp-shape-3"></div>
                <div className="wp-floating-shape wp-shape-4"></div>
            </div>
        </div>

        {/* Features Section */}
        <div className="wp-features-section">
            <div className="wp-section-header">
                <h2 className="wp-section-title">Tại sao chọn BrainGame?</h2>
                <p className="wp-section-subtitle">
                    Khám phá những tính năng độc đáo giúp bạn phát triển tối đa tiềm năng
                </p>
            </div>

            <div className="wp-features-grid">
                <div className="wp-feature-card">
                    <div className="wp-feature-icon-wrapper">
                        <div className="wp-feature-icon"></div>
                    </div>
                    <h3 className="wp-feature-title">Rèn luyện trí não</h3>
                    <p className="wp-feature-text">
                        Các bài tập được thiết kế khoa học giúp phát triển tư duy logic và khả năng tập trung.
                    </p>
                </div>
                <div className="wp-feature-card">
                    <div className="wp-feature-icon-wrapper">
                        <div className="wp-feature-icon"></div>
                    </div>
                    <h3 className="wp-feature-title">Theo dõi tiến độ</h3>
                    <p className="wp-feature-text">
                        Hệ thống thống kê chi tiết giúp bạn theo dõi sự tiến bộ của bản thân.
                    </p>
                </div>
                <div className="wp-feature-card">
                    <div className="wp-feature-icon-wrapper">
                        <div className="wp-feature-icon"></div>
                    </div>
                    <h3 className="wp-feature-title">Đa dạng thử thách</h3>
                    <p className="wp-feature-text">
                        Nhiều thể loại game hấp dẫn, phù hợp với mọi lứa tuổi và trình độ.
                    </p>
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="wp-cta-section">
            <div className="wp-cta-content">
                <h2 className="wp-cta-title">Sẵn sàng bắt đầu hành trình?</h2>
                <p className="wp-cta-subtitle">Tham gia cùng hàng ngàn người dùng đã cải thiện khả năng tư duy</p>
                <button
                    className="wp-btn primary wp-cta-button"
                    onClick={() => buttonGroupRef.current?.scrollIntoView({behavior: 'smooth'})}
                >
                    Bắt đầu ngay
                </button>

            </div>
        </div>
        <Footer/>
    </div>);
}

export default WelcomePage;
