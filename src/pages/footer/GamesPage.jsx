import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {
    FaBolt, FaBrain, FaBullseye, FaCalculator, FaChartLine, FaLanguage, FaLightbulb, FaSearch, FaStar, FaUsers
} from 'react-icons/fa';
import '../../style/pages/footer/GamesPage.css';

function GamesPage() {
    // State cho danh mục đang chọn
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');

    // Dữ liệu mẫu cho các trò chơi
    const games = [{
        id: 1,
        title: 'Trò Chơi Trí Nhớ',
        description: 'Rèn luyện khả năng ghi nhớ thông qua các bài tập thú vị và thách thức.',
        image: '/images/games/memory-game.jpg',
        category: 'Trí nhớ',
        difficulty: 'Dễ đến Khó',
        path: '/games/memory',
        icon: <FaBrain/>,
        players: '1 người chơi',
        rating: 4.8,
        playCount: '25K+'
    }, {
        id: 2,
        title: 'Giải Đố Logic',
        description: 'Thử thách tư duy logic của bạn với các câu đố hấp dẫn và đầy thách thức.',
        image: '/images/games/logic-puzzle.jpg',
        category: 'Logic',
        difficulty: 'Trung bình đến Khó',
        path: '/games/logic',
        icon: <FaLightbulb/>,
        players: '1 người chơi',
        rating: 4.9,
        playCount: '30K+'
    }, {
        id: 3,
        title: 'Toán Học Nhanh',
        description: 'Cải thiện kỹ năng tính toán và phản xạ với các bài toán nhanh.',
        image: '/images/games/math-game.jpg',
        category: 'Toán học',
        difficulty: 'Dễ đến Trung bình',
        path: '/games/math',
        icon: <FaCalculator/>,
        players: '1-2 người chơi',
        rating: 4.7,
        playCount: '40K+'
    }, {
        id: 4,
        title: 'Từ Vựng',
        description: 'Mở rộng vốn từ vựng của bạn thông qua các trò chơi từ vựng thú vị.',
        image: '/images/games/vocabulary.jpg',
        category: 'Ngôn ngữ',
        difficulty: 'Dễ đến Khó',
        path: '/games/vocabulary',
        icon: <FaLanguage/>,
        players: '1-4 người chơi',
        rating: 4.6,
        playCount: '20K+'
    }, {
        id: 5,
        title: 'Tập Trung',
        description: 'Rèn luyện khả năng tập trung và chú ý của bạn.',
        image: '/images/games/focus.jpg',
        category: 'Tập trung',
        difficulty: 'Dễ đến Khó',
        path: '/games/focus',
        icon: <FaBullseye/>,
        players: '1 người chơi',
        rating: 4.5,
        playCount: '15K+'
    }, {
        id: 6,
        title: 'Tốc Độ Phản Xạ',
        description: 'Cải thiện tốc độ phản xạ và khả năng xử lý thông tin nhanh chóng.',
        image: '/images/games/reflex.jpg',
        category: 'Phản xạ',
        difficulty: 'Dễ đến Trung bình',
        path: '/games/reflex',
        icon: <FaBolt/>,
        players: '1-2 người chơi',
        rating: 4.7,
        playCount: '35K+'
    }];

    // Các danh mục trò chơi
    const categories = ['Tất cả', 'Trí nhớ', 'Logic', 'Toán học', 'Ngôn ngữ', 'Tập trung', 'Phản xạ'];

    // Lọc trò chơi theo danh mục và tìm kiếm
    const filteredGames = games.filter(game => {
        const matchesCategory = activeCategory === 'Tất cả' || game.category === activeCategory;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || game.description.toLowerCase().includes(searchTerm.toLowerCase());
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
            case 'Logic':
                return <FaLightbulb/>;
            case 'Toán học':
                return <FaCalculator/>;
            case 'Ngôn ngữ':
                return <FaLanguage/>;
            case 'Tập trung':
                return <FaBullseye/>;
            case 'Phản xạ':
                return <FaBolt/>;
            default:
                return null;
        }
    };

    return (<div className="games-page">
        {/* Hero Section */}
        <div className="games-hero">
            <div className="games-hero-content">
                <h1>Trò Chơi Trí Não</h1>
                <p>Rèn luyện não bộ của bạn với các trò chơi thú vị và bổ ích</p>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <FaBrain className="stat-icon"/>
                        <span>50+ Trò chơi</span>
                    </div>
                    <div className="hero-stat">
                        <FaUsers className="stat-icon"/>
                        <span>100K+ Người chơi</span>
                    </div>
                    <div className="hero-stat">
                        <FaChartLine className="stat-icon"/>
                        <span>Theo dõi tiến trình</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="games-container">
            {/* Filter Section */}
            <div className="games-filter-section">
                <div className="filter-header">
                    <h2>Khám phá trò chơi</h2>
                    <p>Tìm trò chơi phù hợp với sở thích và mục tiêu của bạn</p>
                </div>

                <div className="games-filter">
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
                                    placeholder="Tìm kiếm trò chơi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="search-btn">Tìm</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Featured Game */}
            <div className="featured-game">
                <div className="featured-game-content">
                    <div className="featured-badge">Nổi bật</div>
                    <h2>Giải Đố Logic</h2>
                    <p>Thử thách tư duy logic của bạn với các câu đố hấp dẫn và đầy thách thức. Trò chơi này sẽ giúp
                        bạn phát triển khả năng suy luận và giải quyết vấn đề.</p>
                    <div className="featured-meta">
                        <div className="featured-rating">
                            <FaStar className="star-icon"/>
                            <span>4.9</span>
                        </div>
                        <div className="featured-players">
                            <FaUsers className="players-icon"/>
                            <span>30K+ người chơi</span>
                        </div>
                    </div>
                    <Link to="/games/logic" className="featured-btn">Chơi Ngay</Link>
                </div>
                <div className="featured-game-image">
                    <div className="featured-img-placeholder" style={{backgroundColor: 'hsl(240, 70%, 75%)'}}>
                        <FaLightbulb className="featured-icon"/>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="games-section">
                <h2>Tất cả trò chơi {activeCategory !== 'Tất cả' ? `- ${activeCategory}` : ''}</h2>

                {filteredGames.length === 0 ? (<div className="no-games">
                    <p>Không tìm thấy trò chơi phù hợp với tìm kiếm của bạn.</p>
                </div>) : (<div className="games-grid">
                    {filteredGames.map(game => (<div className="game-card" key={game.id}>
                        <div className="game-image">
                            {/* Sử dụng hình ảnh mẫu nếu không có hình thật */}
                            <div className="game-img-placeholder"
                                 style={{backgroundColor: `hsl(${game.id * 60}, 70%, 75%)`}}>
                                {game.icon}
                            </div>
                            <div className="game-difficulty-badge">{game.difficulty}</div>
                        </div>
                        <div className="game-info">
                            <div className="game-category-badge">
                                {getCategoryIcon(game.category)}
                                <span>{game.category}</span>
                            </div>
                            <h3>{game.title}</h3>
                            <p className="game-description">{game.description}</p>
                            <div className="game-meta">
                                <div className="game-rating">
                                    <FaStar className="star-icon"/>
                                    <span>{game.rating}</span>
                                </div>
                                <div className="game-players">
                                    <FaUsers className="players-icon"/>
                                    <span>{game.players}</span>
                                </div>
                            </div>
                            <Link to={game.path} className="play-btn">Chơi Ngay</Link>
                        </div>
                    </div>))}
                </div>)}
            </div>

            {/* Benefits Section */}
            <div className="games-benefits">
                <h2>Lợi ích của trò chơi trí não</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <FaBrain/>
                        </div>
                        <h3>Cải thiện trí nhớ</h3>
                        <p>Các trò chơi trí nhớ giúp tăng cường khả năng ghi nhớ ngắn hạn và dài hạn.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <FaLightbulb/>
                        </div>
                        <h3>Phát triển tư duy</h3>
                        <p>Rèn luyện khả năng suy luận logic và giải quyết vấn đề hiệu quả.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <FaBullseye/>
                        </div>
                        <h3>Tăng khả năng tập trung</h3>
                        <p>Cải thiện sự tập trung và kéo dài thời gian chú ý vào một nhiệm vụ.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">
                            <FaBolt/>
                        </div>
                        <h3>Nâng cao phản xạ</h3>
                        <p>Tăng tốc độ xử lý thông tin và phản ứng nhanh với các kích thích.</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="games-cta">
                <h2>Bắt đầu hành trình phát triển trí não của bạn</h2>
                <p>Đăng ký tài khoản để theo dõi tiến trình và mở khóa tất cả các trò chơi</p>
                <div className="cta-buttons">
                    <Link to="/register" className="cta-button primary">Đăng ký ngay</Link>
                    <Link to="/about" className="cta-button secondary">Tìm hiểu thêm</Link>
                </div>
            </div>
        </div>
    </div>);
}

export default GamesPage;
