import React from 'react';
import { Link } from 'react-router-dom';
import '../style/layouts/Footer.css';
import { FaFacebook, FaInstagram, FaYoutube, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

function Footer() {
  return (
      <footer className="footer-container">
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
                Nền tảng trò chơi trí não hàng đầu Việt Nam, giúp bạn rèn luyện tư duy và cải thiện trí nhớ mỗi ngày.
              </p>
              <div className="social-links">
                <a href="https://www.facebook.com/toobidu/" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <FaFacebook size={20} />
                </a>
                <a href="https://x.com/dungtien3kk" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <FaXTwitter size={20} />
                </a>
                <a href="https://www.instagram.com/toobidu/" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <FaInstagram size={20} />
                </a>
                <a href="https://www.youtube.com/@tenban" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                  <FaYoutube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3>Liên kết nhanh</h3>
              <div className="footer-links">
                <Link to="/about">Về chúng tôi</Link>
                <Link to="/games">Trò chơi</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/contact">Liên hệ</Link>
                <Link to="/leaderboard">Bảng xếp hạng</Link>
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
                  <FaEnvelope className="contact-icon" />
                  <span>dungto0300567@gmail.com</span>
                </div>
                <div className="contact-item">
                  <FaPhoneAlt className="contact-icon" />
                  <span>0348569975</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
              </div>

              {/* Newsletter */}
              <div className="newsletter">
                <h4>Đăng ký nhận tin</h4>
                <div className="newsletter-form">
                  <input type="email" placeholder="Email của bạn" />
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
            {/*<div className="footer-bottom-links">
              <Link to="/sitemap">Sơ đồ trang</Link>
              <Link to="/accessibility">Khả năng tiếp cận</Link>
              <Link to="/cookies">Cookies</Link>
            </div>*/}
          </div>
        </div>
      </footer>
  );
}

export default Footer;
