import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {FiLogOut, FiSettings, FiUser} from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import '../style/layouts/Header.css';

function Header({userName, handleLogout}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();


    // Fallback tốt hơn cho userName
    const actualUserName = userName || localStorage.getItem('username') || 'User';
    const userInitial = actualUserName && actualUserName.length > 0 ? actualUserName.charAt(0).toUpperCase() : 'U';


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMenuOpen && !e.target.closest('.user-menu')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    return (<header className="hd-header">
        <div className="hd-header-content">
            <div className="hd-header-left">
                <Link to="/dashboard" className="hd-logo">
                    BrainGame
                </Link>
            </div>

            <div className="hd-header-center">
                <SearchBar/>
            </div>

            <nav className="hd-nav">
                <Link to="/dashboard" className="hd-nav-link">Trang chủ</Link>
                <Link to="/games" className="hd-nav-link">Trò chơi</Link>
                <Link to="/leaderboard" className="hd-nav-link">Bảng xếp hạng</Link>

                <div className="hd-header-actions">

                    <div className="hd-user-menu">
                        <button
                            className="hd-user-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="hd-avatar">{userInitial}</div>
                        </button>

                        <div className={`hd-dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                            <button className="hd-dropdown-item" onClick={handleProfileClick}>
                                <FiUser/> Hồ sơ cá nhân
                            </button>
                            <button className="hd-dropdown-item" onClick={() => navigate('/settings')}>
                                <FiSettings/> Cài đặt
                            </button>
                            <div className="hd-dropdown-divider"></div>
                            <button className="hd-dropdown-item logout" onClick={handleLogout}>
                                <FiLogOut/> Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>);
}

export default Header;
