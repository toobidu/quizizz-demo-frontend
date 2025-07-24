import {useNavigate} from 'react-router-dom';

function QuickActionsSection() {
    const navigate = useNavigate();

    const quickActions = [{
        title: 'Chơi ngay', desc: 'Bắt đầu trò chơi mới', action: () => navigate('/games')
    }, {
        title: 'Xem bảng xếp hạng', desc: 'Top người chơi', action: () => navigate('/leaderboard')
    }, {title: 'Hồ sơ cá nhân', desc: 'Xem thống kê của bạn', action: () => navigate('/profile')}];

    return (<div className="mp-actions-section">
        <h2 className="mp-section-title">Hành động nhanh</h2>
        <div className="mp-actions-grid">
            {quickActions.map((action, index) => (<button
                key={index}
                className="mp-action-card"
                onClick={action.action}
            >
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
            </button>))}
        </div>
    </div>);
}

export default QuickActionsSection;
