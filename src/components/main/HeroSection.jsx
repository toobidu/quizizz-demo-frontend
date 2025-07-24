import {useNavigate} from 'react-router-dom';
import {FiAward, FiTrendingUp, FiZap} from 'react-icons/fi';
import {GiBrain} from 'react-icons/gi';
import WelcomeMessage from "../../data/logic/WelcomeMessage.jsx";
import {useState} from 'react';
import ChallengeModal from "../ChallengeModal";

function HeroSection({userName, stats}) {
    const navigate = useNavigate();
    const [showChallengeModal, setShowChallengeModal] = useState(false);

    return (<div className="mp-hero-section">
        <div className="mp-hero-content">
            <div className="mp-hero-left">
                <h1 className="mp-hero-title">Xin chào, {userName}!</h1>
                <div className="mp-hero-subtitle">
                    <WelcomeMessage/>
                </div>
                <div className="mp-hero-actions">
                    <button
                        className="mp-hero-button primary"
                        onClick={() => navigate('/rooms')}
                    >
                        <FiZap/> Bắt đầu ngay
                    </button>
                    <button
                        className="mp-hero-button secondary"
                        onClick={() => navigate('/leaderboard')}
                    >
                        <FiTrendingUp/> Xem xếp hạng
                    </button>
                </div>
            </div>
            <div className="mp-hero-right">
                <div className="mp-hero-decoration">
                    <div className="mp-brain-icon-container">
                        <GiBrain className="mp-brain-icon-main"/>
                    </div>
                </div>
                <div className="mp-hero-badge">
                    <FiAward className="mp-badge-icon"/>
                    <span>Top {stats.rank !== 'N/A' ? stats.rank : '100'}</span>
                </div>
            </div>
        </div>
        <div className="mp-hero-particles">
            {[...Array(10)].map((_, i) => (<div key={i} className={`mp-particle mp-particle-${i + 1}`}></div>))}
        </div>
        <ChallengeModal
            isOpen={showChallengeModal}
            onClose={() => setShowChallengeModal(false)}
        />
    </div>);
}

export default HeroSection;
