import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import WelcomeMessage from "../data/logic/WelcomeMessage.jsx";
import useUserStore from '../hooks/useUserStore';
import { FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';
import '../style/pages/MainPage.css';

function MainPage() {
    const navigate = useNavigate();
    const { userName, stats, loading, fetchUserProfile, logout } = useUserStore();

    useEffect(() => {
        fetchUserProfile();

        // Không cần return cleanup vì socketService.disconnect()
        // sẽ được xử lý trong logout action
    }, [fetchUserProfile]);

    const handleLogout = () => {
        logout(navigate);
    };

    const quickActions = [
        { title: 'Chơi ngay', desc: 'Bắt đầu trò chơi mới', action: () => navigate('/games') },
        { title: 'Xem bảng xếp hạng', desc: 'Top người chơi', action: () => navigate('/leaderboard') },
        { title: 'Hồ sơ cá nhân', desc: 'Xem thống kê của bạn', action: () => navigate('/profile') }
    ];

    return (
        <div className="mp-main-layout">
            <Header userName={userName} handleLogout={handleLogout} />

            <main className="mp-main-content">
                <div className="mp-hero-section">
                    <div className="mp-hero-content">
                        <div className="mp-hero-left">
                            <h1 className="mp-hero-title">Xin chào, {userName}!</h1>
                            <div className="mp-hero-subtitle">
                                <WelcomeMessage />
                            </div>
                            <div className="mp-hero-actions">
                                <button 
                                    className="mp-hero-button primary" 
                                    onClick={() => navigate('/games')}
                                >
                                    <FiZap /> Bắt đầu thử thách
                                </button>
                                <button 
                                    className="mp-hero-button secondary" 
                                    onClick={() => navigate('/leaderboard')}
                                >
                                    <FiTrendingUp /> Xem xếp hạng
                                </button>
                            </div>
                        </div>
                        <div className="mp-hero-right">
                            <div className="mp-hero-decoration">
                                <div className="mp-brain-icon">🧠</div>
                            </div>
                            <div className="mp-hero-badge">
                                <FiAward className="mp-badge-icon" />
                                <span>Top {stats.rank !== 'N/A' ? stats.rank : '100'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mp-hero-particles">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`mp-particle mp-particle-${i + 1}`}></div>
                        ))}
                    </div>
                </div>

                <div className="mp-stats-section">
                    <div className="mp-stats-grid">
                        <div className="mp-stat-card">
                            <div className="mp-stat-value">{loading ? '...' : stats.gamesPlayed}</div>
                            <div className="mp-stat-label">Số lần chơi</div>
                        </div>
                        <div className="mp-stat-card">
                            <div className="mp-stat-value">{loading ? '...' : stats.highScore.toLocaleString()}</div>
                            <div className="mp-stat-label">Điểm cao nhất</div>
                        </div>
                        <div className="mp-stat-card">
                            <div className="mp-stat-value">{loading ? '...' : `#${stats.rank}`}</div>
                            <div className="mp-stat-label">Xếp hạng</div>
                        </div>
                        <div className="mp-stat-card">
                            <div className="mp-stat-value">{loading ? '...' : stats.medals}</div>
                            <div className="mp-stat-label">Huy chương</div>
                        </div>
                    </div>
                </div>

                <div className="mp-actions-section">
                    <h2 className="mp-section-title">Hành động nhanh</h2>
                    <div className="mp-actions-grid">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="mp-action-card"
                                onClick={action.action}
                            >
                                <h3>{action.title}</h3>
                                <p>{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default MainPage;
