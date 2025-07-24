import React, {useState} from 'react';
import '../../style/pages/footer/FeedbackPage.css';
import {FaFrown, FaMeh, FaPaperPlane, FaSmile, FaStar} from 'react-icons/fa';

function FeedbackPage() {
    // State cho đánh giá sao
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    // State cho loại phản hồi
    const [feedbackType, setFeedbackType] = useState('');

    // State cho biểu mẫu
    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: '', experience: ''
    });

    // Xử lý thay đổi biểu mẫu
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData, [name]: value
        });
    };

    // Xử lý gửi biểu mẫu
    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý gửi phản hồi ở đây

        // Reset form sau khi gửi
        setRating(0);
        setFeedbackType('');
        setFormData({
            name: '', email: '', subject: '', message: '', experience: ''
        });

        // Hiển thị thông báo thành công (trong thực tế sẽ có xử lý API)
        alert('Cảm ơn bạn đã gửi phản hồi!');
    };

    return (<div className="feedback-container">
        <div className="feedback-header">
            <h1>Phản Hồi</h1>
            <p>Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn</p>
        </div>

        <div className="feedback-content">
            <div className="feedback-intro">
                <h2>Chúng tôi luôn lắng nghe bạn</h2>
                <p>
                    Tại BrainGame, chúng tôi luôn cố gắng cải thiện trải nghiệm của người dùng.
                    Phản hồi của bạn rất quan trọng đối với chúng tôi và giúp chúng tôi phát triển
                    các tính năng và trò chơi mới phù hợp với nhu cầu của bạn.
                </p>
            </div>

            <div className="feedback-form-section">
                <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="form-group rating-section">
                        <h3>Bạn đánh giá trải nghiệm với BrainGame như thế nào?</h3>
                        <div className="star-rating">
                            {[...Array(5)].map((star, index) => {
                                const ratingValue = index + 1;
                                return (<label key={index}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <FaStar
                                        className="star"
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={30}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>);
                            })}
                        </div>
                        <div className="rating-text">
                            {rating === 1 && "Rất không hài lòng"}
                            {rating === 2 && "Không hài lòng"}
                            {rating === 3 && "Bình thường"}
                            {rating === 4 && "Hài lòng"}
                            {rating === 5 && "Rất hài lòng"}
                        </div>
                    </div>

                    <div className="form-group feedback-type">
                        <h3>Loại phản hồi của bạn là gì?</h3>
                        <div className="feedback-type-options">
                            <button
                                type="button"
                                className={`type-btn ${feedbackType === 'suggestion' ? 'active' : ''}`}
                                onClick={() => setFeedbackType('suggestion')}
                            >
                                <FaSmile className="type-icon"/>
                                <span>Đề xuất</span>
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${feedbackType === 'issue' ? 'active' : ''}`}
                                onClick={() => setFeedbackType('issue')}
                            >
                                <FaMeh className="type-icon"/>
                                <span>Vấn đề</span>
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${feedbackType === 'complaint' ? 'active' : ''}`}
                                onClick={() => setFeedbackType('complaint')}
                            >
                                <FaFrown className="type-icon"/>
                                <span>Khiếu nại</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Họ và tên</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nhập họ và tên của bạn"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ email của bạn"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Chủ đề</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Nhập chủ đề phản hồi"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Nội dung phản hồi</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="5"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Nhập nội dung phản hồi chi tiết của bạn"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="experience">Trải nghiệm của bạn</label>
                        <select
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn trải nghiệm --</option>
                            <option value="website">Trang web</option>
                            <option value="games">Trò chơi</option>
                            <option value="account">Tài khoản</option>
                            <option value="payment">Thanh toán</option>
                            <option value="support">Hỗ trợ khách hàng</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">
                        <FaPaperPlane className="submit-icon"/>
                        Gửi Phản Hồi
                    </button>
                </form>
            </div>

            <div className="feedback-info">
                <div className="info-card">
                    <h3>Phản hồi của bạn rất quan trọng</h3>
                    <p>
                        Chúng tôi xem xét tất cả các phản hồi nhận được và sử dụng chúng để cải thiện dịch vụ của
                        mình.
                        Mỗi ý kiến đóng góp đều có giá trị đối với chúng tôi.
                    </p>
                </div>

                <div className="info-card">
                    <h3>Thời gian phản hồi</h3>
                    <p>
                        Chúng tôi cố gắng phản hồi tất cả các yêu cầu trong vòng 24-48 giờ làm việc.
                        Đối với các vấn đề khẩn cấp, vui lòng liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi.
                    </p>
                </div>

                <div className="info-card">
                    <h3>Cách khác để liên hệ</h3>
                    <p>
                        Ngoài biểu mẫu này, bạn cũng có thể liên hệ với chúng tôi qua email support@braingame.vn
                        hoặc gọi điện thoại theo số 0123 456 789 trong giờ làm việc.
                    </p>
                </div>
            </div>
        </div>
    </div>);
}

export default FeedbackPage;
