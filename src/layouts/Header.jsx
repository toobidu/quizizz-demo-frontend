import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import '../style/layouts/Header.css';

function Header({ userName, handleLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

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

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            BrainGame
          </Link>
        </div>

        <div className="header-center">
          <SearchBar />
        </div>

        <nav className="nav">
          <Link to="/dashboard" className="nav-link">Trang chủ</Link>
          <Link to="/games" className="nav-link">Trò chơi</Link>
          <Link to="/leaderboard" className="nav-link">Bảng xếp hạng</Link>

          <div className="header-actions">

            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="avatar">{userInitial}</div>
              </button>

              <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <FiUser /> Hồ sơ cá nhân
                </button>
                <button className="dropdown-item" onClick={() => navigate('/settings')}>
                  <FiSettings /> Cài đặt
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut /> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
