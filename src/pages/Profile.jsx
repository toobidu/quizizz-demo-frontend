import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import { FiUser, FiUsers, FiTarget, FiCalendar, FiLoader } from 'react-icons/fi';
import '../style/pages/Profile.css';

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('username');
    const isOwnProfile = !username || username === currentUser;

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let data;

                if (isOwnProfile) {
                    data = await profileApi.getMyProfile();
                } else {
                    data = await profileApi.searchUser(username);
                }

                if (data.success) {
                    setProfileData(data.data);
                } else {
                    setError(data.message || 'Không thể tải thông tin profile');
                }
            } catch (err) {
                setError('Lỗi kết nối đến server');
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, isOwnProfile]);

    const handleLogout = async () => {
        await authApi.logout();
        localStorage.removeItem('username');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="profile-layout">
                <Header userName={currentUser} handleLogout={handleLogout} />
                <div className="loading-container">
                    <FiLoader className="loading-spinner" />
                    <p>Đang tải thông tin...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-layout">
                <Header userName={currentUser} handleLogout={handleLogout} />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        Quay lại trang chủ
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="profile-layout">
            <Header userName={currentUser} handleLogout={handleLogout} />

            <main className="profile-content">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profileData?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <h1>{profileData?.username || 'Unknown User'}</h1>
                        <p className="join-date">
                            <FiCalendar /> Tham gia từ {profileData?.joinDate ? new Date(profileData.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-card">
                        <FiTarget className="stat-icon" />
                        <div className="stat-value">{profileData?.gamesPlayed || 0}</div>
                        <div className="stat-label">Trò chơi đã chơi</div>
                    </div>
                    <div className="stat-card">
                        <FiUsers className="stat-icon" />
                        <div className="stat-value">{profileData?.highScore?.toLocaleString() || 0}</div>
                        <div className="stat-label">Điểm cao nhất</div>
                    </div>
                    <div className="stat-card">
                        <FiUser className="stat-icon" />
                        <div className="stat-value">#{profileData?.rank || 'N/A'}</div>
                        <div className="stat-label">Xếp hạng</div>
                    </div>
                    <div className="stat-card">
                        <FiTrophy className="stat-icon" />
                        <div className="stat-value">{profileData?.medals || 0}</div>
                        <div className="stat-label">Huy chương</div>
                    </div>
                </div>

                <div className="achievements-section">
                    <h2>Thành tích</h2>
                    <div className="achievements-grid">
                        {profileData?.achievements?.length > 0 ? (
                            profileData.achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                                >
                                    <div className="achievement-icon">
                                        <FiTrophy />
                                    </div>
                                    <h3>{achievement.name}</h3>
                                    <p>{achievement.desc}</p>
                                </div>
                            ))
                        ) : (
                            <div className="no-achievements">
                                <p>Chưa có thành tích nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Profile;
