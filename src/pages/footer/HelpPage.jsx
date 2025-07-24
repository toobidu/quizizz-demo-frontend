import React from 'react';
import {Link} from 'react-router-dom';
import '../../style/pages/footer/HelpPage.css';
import {FaBook, FaHeadset, FaQuestionCircle, FaSearch, FaTools, FaUserShield} from 'react-icons/fa';

function HelpPage() {
    // Dữ liệu mẫu cho các câu hỏi phổ biến
    const popularQuestions = [{
        id: 1,
        question: 'Làm thế nào để tạo tài khoản mới?',
        answer: 'Để tạo tài khoản mới, hãy nhấp vào nút "Đăng ký" ở góc trên bên phải của trang web. Sau đó, điền thông tin cá nhân của bạn và làm theo hướng dẫn để hoàn tất quá trình đăng ký.',
        category: 'Tài khoản'
    }, {
        id: 2,
        question: 'Tôi quên mật khẩu, làm cách nào để đặt lại?',
        answer: 'Nếu bạn quên mật khẩu, hãy nhấp vào liên kết "Quên mật khẩu" trên trang đăng nhập. Nhập địa chỉ email đã đăng ký của bạn và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.',
        category: 'Tài khoản'
    }, {
        id: 3,
        question: 'Làm thế nào để bắt đầu chơi trò chơi?',
        answer: 'Để bắt đầu chơi trò chơi, hãy đăng nhập vào tài khoản của bạn, sau đó truy cập vào trang "Trò chơi". Chọn trò chơi bạn muốn chơi và nhấp vào nút "Chơi ngay".',
        category: 'Trò chơi'
    }, {
        id: 4,
        question: 'Làm thế nào để theo dõi tiến trình của tôi?',
        answer: 'Bạn có thể theo dõi tiến trình của mình bằng cách truy cập vào trang "Hồ sơ" sau khi đăng nhập. Tại đây, bạn sẽ thấy thống kê về các trò chơi đã chơi, điểm số và tiến trình học tập của mình.',
        category: 'Tiến trình'
    }, {
        id: 5,
        question: 'Các trò chơi có hoạt động trên điện thoại di động không?',
        answer: 'Có, tất cả các trò chơi của chúng tôi đều được thiết kế để hoạt động trên cả máy tính và thiết bị di động. Bạn có thể truy cập trang web của chúng tôi từ trình duyệt di động hoặc tải xuống ứng dụng di động của chúng tôi.',
        category: 'Kỹ thuật'
    }, {
        id: 6,
        question: 'Làm thế nào để báo cáo lỗi hoặc vấn đề?',
        answer: 'Để báo cáo lỗi hoặc vấn đề, hãy truy cập trang "Liên hệ" và điền vào biểu mẫu liên hệ với chi tiết về vấn đề bạn đang gặp phải. Bạn cũng có thể gửi email trực tiếp đến support@braingame.vn.',
        category: 'Hỗ trợ'
    }];

    // Các danh mục trợ giúp
    const helpCategories = [{
        id: 1,
        title: 'Hướng dẫn sử dụng',
        icon: <FaBook/>,
        description: 'Hướng dẫn chi tiết về cách sử dụng các tính năng của BrainGame',
        link: '/help/guides'
    }, {
        id: 2,
        title: 'Câu hỏi thường gặp',
        icon: <FaQuestionCircle/>,
        description: 'Danh sách các câu hỏi và câu trả lời phổ biến',
        link: '/faq'
    }, {
        id: 3,
        title: 'Hỗ trợ trực tiếp',
        icon: <FaHeadset/>,
        description: 'Liên hệ với đội ngũ hỗ trợ của chúng tôi',
        link: '/contact'
    }, {
        id: 4,
        title: 'Xử lý sự cố',
        icon: <FaTools/>,
        description: 'Hướng dẫn khắc phục các vấn đề kỹ thuật thường gặp',
        link: '/help/troubleshooting'
    }, {
        id: 5,
        title: 'Bảo mật & Quyền riêng tư',
        icon: <FaUserShield/>,
        description: 'Thông tin về cách chúng tôi bảo vệ dữ liệu của bạn',
        link: '/privacy'
    }];

    return (<div className="help-container">
        <div className="help-header">
            <h1>Trung Tâm Trợ Giúp</h1>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>

            <div className="help-search">
                <div className="search-box">
                    <FaSearch className="search-icon"/>
                    <input type="text" placeholder="Tìm kiếm câu hỏi hoặc chủ đề..."/>
                    <button className="search-btn">Tìm kiếm</button>
                </div>
            </div>
        </div>

        <div className="help-categories">
            {helpCategories.map(category => (<Link to={category.link} className="category-card" key={category.id}>
                <div className="category-icon">
                    {category.icon}
                </div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
            </Link>))}
        </div>

        <div className="popular-questions">
            <h2>Câu Hỏi Phổ Biến</h2>
            <div className="questions-list">
                {popularQuestions.map(item => (<div className="question-item" key={item.id}>
                    <div className="question-header">
                        <h3>{item.question}</h3>
                        <span className="question-category">{item.category}</span>
                    </div>
                    <div className="question-answer">
                        <p>{item.answer}</p>
                    </div>
                </div>))}
            </div>
        </div>

        <div className="help-contact">
            <h2>Vẫn Cần Trợ Giúp?</h2>
            <p>Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, hãy liên hệ với đội ngũ hỗ trợ của chúng
                tôi.</p>
            <Link to="/contact" className="contact-btn">Liên Hệ Hỗ Trợ</Link>
        </div>
    </div>);
}

export default HelpPage;
