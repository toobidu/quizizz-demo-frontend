import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {
    FaAppleAlt,
    FaBookmark,
    FaBrain,
    FaBullseye,
    FaCalendarAlt,
    FaClock,
    FaLanguage,
    FaLightbulb,
    FaSearch,
    FaShare,
    FaSmile,
    FaUser
} from 'react-icons/fa';
import '../../style/pages/footer/BlogPage.css';

function BlogPage() {
    // State cho danh mục đang chọn
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');

    // Dữ liệu mẫu cho các bài viết blog
    const blogPosts = [{
        id: 1,
        title: 'Cách Rèn Luyện Trí Nhớ Hiệu Quả',
        excerpt: 'Khám phá các phương pháp khoa học để cải thiện trí nhớ và khả năng ghi nhớ thông tin dài hạn.',
        image: '/images/blog/memory-training.jpg',
        author: 'Nguyễn Văn A',
        date: '15/07/2025',
        category: 'Trí nhớ',
        slug: 'cach-ren-luyen-tri-nho-hieu-qua',
        readTime: '5 phút đọc',
        icon: <FaBrain/>
    }, {
        id: 2,
        title: 'Tại Sao Trò Chơi Trí Não Lại Quan Trọng?',
        excerpt: 'Tìm hiểu về tầm quan trọng của các trò chơi trí não đối với sự phát triển nhận thức và sức khỏe tinh thần.',
        image: '/images/blog/brain-games-importance.jpg',
        author: 'Trần Thị B',
        date: '10/07/2025',
        category: 'Khoa học não bộ',
        slug: 'tai-sao-tro-choi-tri-nao-lai-quan-trong',
        readTime: '7 phút đọc',
        icon: <FaLightbulb/>
    }, {
        id: 3,
        title: '5 Bài Tập Đơn Giản Để Tăng Cường Tập Trung',
        excerpt: 'Những bài tập đơn giản bạn có thể thực hiện hàng ngày để cải thiện khả năng tập trung và chú ý.',
        image: '/images/blog/focus-exercises.jpg',
        author: 'Lê Văn C',
        date: '05/07/2025',
        category: 'Tập trung',
        slug: '5-bai-tap-don-gian-de-tang-cuong-tap-trung',
        readTime: '4 phút đọc',
        icon: <FaBullseye/>
    }, {
        id: 4,
        title: 'Mối Liên Hệ Giữa Dinh Dưỡng và Sức Khỏe Não Bộ',
        excerpt: 'Khám phá cách thức dinh dưỡng ảnh hưởng đến sức khỏe não bộ và các thực phẩm tốt cho não.',
        image: '/images/blog/nutrition-brain.jpg',
        author: 'Phạm Thị D',
        date: '01/07/2025',
        category: 'Dinh dưỡng',
        slug: 'moi-lien-he-giua-dinh-duong-va-suc-khoe-nao-bo',
        readTime: '6 phút đọc',
        icon: <FaAppleAlt/>
    }, {
        id: 5,
        title: 'Cách Giảm Stress và Cải Thiện Khả Năng Tư Duy',
        excerpt: 'Các phương pháp hiệu quả để giảm stress và cải thiện khả năng tư duy sáng tạo.',
        image: '/images/blog/stress-thinking.jpg',
        author: 'Hoàng Văn E',
        date: '25/06/2025',
        category: 'Sức khỏe tinh thần',
        slug: 'cach-giam-stress-va-cai-thien-kha-nang-tu-duy',
        readTime: '5 phút đọc',
        icon: <FaSmile/>
    }, {
        id: 6,
        title: 'Lợi Ích Của Việc Học Ngôn Ngữ Mới Đối Với Não Bộ',
        excerpt: 'Tìm hiểu về những lợi ích tuyệt vời của việc học ngôn ngữ mới đối với sự phát triển của não bộ.',
        image: '/images/blog/language-learning.jpg',
        author: 'Nguyễn Thị F',
        date: '20/06/2025',
        category: 'Ngôn ngữ',
        slug: 'loi-ich-cua-viec-hoc-ngon-ngu-moi-doi-voi-nao-bo',
        readTime: '8 phút đọc',
        icon: <FaLanguage/>
    }];

    // Các danh mục blog
    const categories = ['Tất cả', 'Trí nhớ', 'Khoa học não bộ', 'Tập trung', 'Dinh dưỡng', 'Sức khỏe tinh thần', 'Ngôn ngữ'];

    // Lọc bài viết theo danh mục và tìm kiếm
    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = activeCategory === 'Tất cả' || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        // Đã xử lý tìm kiếm thông qua state searchTerm
    };

    // Hiển thị icon cho danh mục
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Trí nhớ':
                return <FaBrain/>;
            case 'Khoa học não bộ':
                return <FaLightbulb/>;
            case 'Tập trung':
                return <FaBullseye/>;
            case 'Dinh dưỡng':
                return <FaAppleAlt/>;
            case 'Sức khỏe tinh thần':
                return <FaSmile/>;
            case 'Ngôn ngữ':
                return <FaLanguage/>;
            default:
                return null;
        }
    };

    return (<div className="blog-page">
        {/* Hero Section */}
        <div className="blog-hero">
            <div className="blog-hero-content">
                <h1>Blog</h1>
                <p>Khám phá các bài viết về khoa học não bộ, phát triển trí tuệ và sức khỏe tinh thần</p>
            </div>
        </div>

        <div className="blog-container">
            {/* Filter Section */}
            <div className="blog-filter-section">
                <div className="filter-header">
                    <h2>Khám phá bài viết</h2>
                    <p>Tìm kiếm các bài viết phù hợp với chủ đề bạn quan tâm</p>
                </div>

                <div className="blog-filter">
                    <div className="category-filter">
                        {categories.map((category, index) => (<button
                            key={index}
                            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {getCategoryIcon(category)}
                            <span>{category}</span>
                        </button>))}
                    </div>
                    <div className="search-filter">
                        <form onSubmit={handleSearch}>
                            <div className="search-input-container">
                                <FaSearch className="search-icon"/>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="search-btn">Tìm</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Featured Post */}
            <div className="featured-post">
                <div className="featured-post-image">
                    <div className="featured-img-placeholder" style={{backgroundColor: 'hsl(200, 70%, 75%)'}}>
                        <FaLightbulb className="featured-icon"/>
                    </div>
                    <div className="featured-badge">Bài viết nổi bật</div>
                </div>
                <div className="featured-post-content">
                    <div className="post-category-badge">
                        <FaLightbulb/>
                        <span>Khoa học não bộ</span>
                    </div>
                    <h2>Tại Sao Trò Chơi Trí Não Lại Quan Trọng?</h2>
                    <p>Tìm hiểu về tầm quan trọng của các trò chơi trí não đối với sự phát triển nhận thức và sức
                        khỏe tinh thần. Các nghiên cứu khoa học đã chứng minh rằng việc tham gia các hoạt động kích
                        thích trí não có thể giúp cải thiện trí nhớ, tăng cường khả năng tập trung và ngăn ngừa suy
                        giảm nhận thức theo tuổi tác.</p>
                    <div className="post-meta">
                        <div className="meta-item">
                            <FaUser className="meta-icon"/>
                            <span>Trần Thị B</span>
                        </div>
                        <div className="meta-item">
                            <FaCalendarAlt className="meta-icon"/>
                            <span>10/07/2025</span>
                        </div>
                        <div className="meta-item">
                            <FaClock className="meta-icon"/>
                            <span>7 phút đọc</span>
                        </div>
                    </div>
                    <div className="post-actions">
                        <Link to="/blog/tai-sao-tro-choi-tri-nao-lai-quan-trong" className="read-more-btn">Đọc
                            Tiếp</Link>
                        <div className="action-buttons">
                            <button className="action-btn bookmark">
                                <FaBookmark/>
                            </button>
                            <button className="action-btn share">
                                <FaShare/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Posts */}
            <div className="blog-posts-section">
                <h2>Bài viết mới nhất {activeCategory !== 'Tất cả' ? `- ${activeCategory}` : ''}</h2>

                {filteredPosts.length === 0 ? (<div className="no-posts">
                    <p>Không tìm thấy bài viết phù hợp với tìm kiếm của bạn.</p>
                </div>) : (<div className="blog-grid">
                    {filteredPosts.map(post => (<div className="blog-card" key={post.id}>
                        <div className="blog-image">
                            <div className="blog-img-placeholder"
                                 style={{backgroundColor: `hsl(${post.id * 60}, 70%, 75%)`}}>
                                {post.icon}
                            </div>
                        </div>
                        <div className="blog-info">
                            <div className="post-category-badge">
                                {getCategoryIcon(post.category)}
                                <span>{post.category}</span>
                            </div>
                            <h3>{post.title}</h3>
                            <p className="post-excerpt">{post.excerpt}</p>
                            <div className="post-meta">
                                <div className="meta-item">
                                    <FaUser className="meta-icon"/>
                                    <span>{post.author}</span>
                                </div>
                                <div className="meta-item">
                                    <FaCalendarAlt className="meta-icon"/>
                                    <span>{post.date}</span>
                                </div>
                            </div>
                            <div className="post-footer">
                                <div className="read-time">
                                    <FaClock className="meta-icon"/>
                                    <span>{post.readTime}</span>
                                </div>
                                <Link to={`/blog/${post.slug}`} className="read-more-link">Đọc tiếp</Link>
                            </div>
                        </div>
                    </div>))}
                </div>)}
            </div>

            {/* Pagination */}
            <div className="blog-pagination">
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">...</button>
                <button className="pagination-btn">10</button>
                <button className="pagination-btn next">Tiếp</button>
            </div>

            {/* Newsletter Section */}
            <div className="blog-newsletter">
                <div className="newsletter-content">
                    <h2>Đăng ký nhận bài viết mới</h2>
                    <p>Nhận thông báo khi có bài viết mới về phát triển trí não và sức khỏe tinh thần</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Email của bạn" required/>
                        <button type="submit">Đăng ký</button>
                    </form>
                    <p className="newsletter-note">Chúng tôi tôn trọng quyền riêng tư của bạn. Bạn có thể hủy đăng
                        ký bất kỳ lúc nào.</p>
                </div>
            </div>
        </div>
    </div>);
}

export default BlogPage;
