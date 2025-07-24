import React from 'react';
import {FaBrain, FaChartLine, FaHistory, FaLightbulb, FaMedal, FaUsers} from 'react-icons/fa';
import '../../style/pages/footer/AboutPage.css';

function AboutPage() {
    return (<div className="about-page">
        {/* Hero Section */}
        <div className="about-hero">
            <div className="about-hero-content">
                <h1>Về Chúng Tôi</h1>
                <p>Nền tảng trò chơi trí não hàng đầu Việt Nam</p>
            </div>
        </div>

        {/* Main Content */}
        <div className="about-container">
            {/* Mission Section */}
            <section className="about-mission">
                <div className="mission-content">
                    <h2>Sứ mệnh của chúng tôi</h2>
                    <p>
                        BrainGame được thành lập với sứ mệnh giúp mọi người phát triển trí tuệ thông qua các trò
                        chơi trí não thú vị và bổ ích.
                        Chúng tôi tin rằng việc rèn luyện não bộ có thể trở nên thú vị và hấp dẫn thông qua các trò
                        chơi được thiết kế khoa học.
                    </p>
                    <div className="mission-stats">
                        <div className="stat-item">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Trò chơi trí tuệ</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">100K+</span>
                            <span className="stat-label">Người dùng</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">5M+</span>
                            <span className="stat-label">Lượt chơi</span>
                        </div>
                    </div>
                </div>
                <div className="mission-image">
                    <img src="/images/about/mission.jpg" alt="Sứ mệnh BrainGame" onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/500x350/5c6bc0/ffffff?text=BrainGame'
                    }}/>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-story">
                <div className="story-image">
                    <img src="/images/about/story.jpg" alt="Câu chuyện BrainGame" onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/500x350/3f51b5/ffffff?text=Our+Story'
                    }}/>
                </div>
                <div className="story-content">
                    <h2>Câu chuyện của chúng tôi</h2>
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-marker"><FaHistory/></div>
                            <div className="timeline-content">
                                <h3>2020</h3>
                                <p>BrainGame được thành lập với ý tưởng ban đầu về một nền tảng học tập thông qua
                                    trò chơi.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-marker"><FaLightbulb/></div>
                            <div className="timeline-content">
                                <h3>2021</h3>
                                <p>Ra mắt phiên bản đầu tiên với 10 trò chơi trí tuệ cơ bản và thu hút 10,000 người
                                    dùng đầu tiên.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-marker"><FaUsers/></div>
                            <div className="timeline-content">
                                <h3>2022</h3>
                                <p>Mở rộng đội ngũ và phát triển thêm 20 trò chơi mới, đạt mốc 50,000 người
                                    dùng.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-marker"><FaChartLine/></div>
                            <div className="timeline-content">
                                <h3>2023</h3>
                                <p>Phát triển tính năng cá nhân hóa và phân tích dữ liệu, giúp người dùng theo dõi
                                    tiến trình học tập hiệu quả hơn.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-marker"><FaMedal/></div>
                            <div className="timeline-content">
                                <h3>2024</h3>
                                <p>Trở thành nền tảng trò chơi trí não hàng đầu Việt Nam với hơn 100,000 người dùng
                                    thường xuyên.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values">
                <h2>Giá trị cốt lõi</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon"><FaBrain/></div>
                        <h3>Khoa học</h3>
                        <p>Mọi trò chơi đều được phát triển dựa trên nghiên cứu khoa học về não bộ và quá trình học
                            tập.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"><FaLightbulb/></div>
                        <h3>Sáng tạo</h3>
                        <p>Luôn đổi mới và tìm kiếm những cách tiếp cận mới để phát triển trí tuệ.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"><FaUsers/></div>
                        <h3>Cộng đồng</h3>
                        <p>Xây dựng cộng đồng học tập và phát triển cùng nhau.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"><FaChartLine/></div>
                        <h3>Tiến bộ</h3>
                        <p>Cam kết giúp người dùng đạt được tiến bộ thực sự trong việc phát triển trí tuệ.</p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-team">
                <h2>Đội ngũ của chúng tôi</h2>
                <p className="team-intro">
                    Đội ngũ BrainGame bao gồm các chuyên gia trong lĩnh vực khoa học thần kinh, thiết kế trò chơi,
                    và phát triển phần mềm. Chúng tôi làm việc với niềm đam mê và sự tận tâm để mang đến những trải
                    nghiệm
                    tốt nhất cho người dùng.
                </p>
                <div className="team-grid">
                    <div className="team-member">
                        <div className="member-photo"
                             style={{backgroundImage: 'url(https://via.placeholder.com/200x200/5c6bc0/ffffff?text=NT)'}}></div>
                        <h3>Nguyễn Thành</h3>
                        <p className="member-title">Nhà sáng lập & CEO</p>
                    </div>
                    <div className="team-member">
                        <div className="member-photo"
                             style={{backgroundImage: 'url(https://via.placeholder.com/200x200/3f51b5/ffffff?text=TL)'}}></div>
                        <h3>Trần Linh</h3>
                        <p className="member-title">Giám đốc sản phẩm</p>
                    </div>
                    <div className="team-member">
                        <div className="member-photo"
                             style={{backgroundImage: 'url(https://via.placeholder.com/200x200/303f9f/ffffff?text=LH)'}}></div>
                        <h3>Lê Hương</h3>
                        <p className="member-title">Trưởng nhóm thiết kế</p>
                    </div>
                    <div className="team-member">
                        <div className="member-photo"
                             style={{backgroundImage: 'url(https://via.placeholder.com/200x200/1a237e/ffffff?text=PM)'}}></div>
                        <h3>Phạm Minh</h3>
                        <p className="member-title">Trưởng nhóm phát triển</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <h2>Sẵn sàng rèn luyện trí não của bạn?</h2>
                <p>Tham gia cùng hơn 100,000 người dùng đang phát triển trí tuệ mỗi ngày</p>
                <div className="cta-buttons">
                    <a href="/register" className="cta-button primary">Đăng ký ngay</a>
                    <a href="/games" className="cta-button secondary">Khám phá trò chơi</a>
                </div>
            </section>
        </div>
    </div>);
}

export default AboutPage;
