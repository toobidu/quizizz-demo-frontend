import React from 'react';
import {Link} from 'react-router-dom';
import '../style/layouts/Footer.css';
import {FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaYoutube} from 'react-icons/fa';
import {FaXTwitter} from 'react-icons/fa6';
import vietnamFlag from '../assets/images/vietnam.png';

function Footer() {
    return (<footer className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-section brand-section">
                    <div className="footer-logo">
                        <h2>BrainGame</h2>
                        <span className="footer-tagline">Rèn luyện não bộ thông minh</span>
                    </div>
                    <p className="brand-description">
                        Nền tảng trò chơi trí não hàng đầu Việt Nam, giúp bạn rèn luyện tư duy và cải thiện trí nhớ
                        mỗi ngày.
                    </p>
                    <div className="footer-social-links">
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"
                           className="footer-social-link facebook">
                            <FaFacebook size={20} style={{color: '#1877f2'}}/>
                        </a>
                        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer"
                           className="footer-social-link twitter">
                            <FaXTwitter size={20} style={{color: '#1DA1F2'}}/>
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
                           className="footer-social-link instagram">
                            <FaInstagram size={20} style={{color: '#E1306C'}}/>
                        </a>
                        <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer"
                           className="footer-social-link youtube">
                            <FaYoutube size={20} style={{color: '#ff0000'}}/>
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h3>Liên kết nhanh</h3>
                    <div className="footer-links">
                        <Link to="/about">Về chúng tôi</Link>
                        <Link to="/blog">Blog</Link>
                        <Link to="/contact">Liên hệ</Link>
                    </div>
                </div>

                {/* Support */}
                <div className="footer-section">
                    <h3>Hỗ trợ</h3>
                    <div className="footer-links">
                        <Link to="/help">Trợ giúp</Link>
                        <Link to="/faq">Câu hỏi thường gặp</Link>
                        <Link to="/privacy">Chính sách bảo mật</Link>
                        <Link to="/terms">Điều khoản sử dụng</Link>
                        <Link to="/feedback">Phản hồi</Link>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="footer-section">
                    <h3>Liên hệ</h3>
                    <div className="contact-info">
                        <div className="contact-item">
                            <FaEnvelope className="contact-icon"/>
                            <span>dungto0300567@gmail.com</span>
                        </div>
                        <div className="contact-item">
                            <FaPhoneAlt className="contact-icon"/>
                            <span>+84 348569975</span>
                        </div>
                        <div className="contact-item">
                            <FaMapMarkerAlt className="contact-icon"/>
                            <span>Hà Nội, Việt Nam</span>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="newsletter">
                        <h4>Đăng ký nhận tin</h4>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Email của bạn"/>
                            <button type="submit">Đăng ký</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
            <div className="footer-bottom-content">
                <div className="copyright">
                    <p>© {new Date().getFullYear()} BrainGame. Tất cả các quyền được bảo lưu.</p>
                </div>
                <div className="made-in-vietnam">
                    <span>Made in</span>
                    <img src={vietnamFlag} alt="Việt Nam" className="vietnam-flag"/>
                </div>
            </div>
        </div>
    </footer>);
}

export default Footer;
