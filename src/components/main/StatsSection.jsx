function StatsSection({stats, loading}) {
    const safeValue = (value, formatter = null) => {
        if (loading) return '...';
        if (value === undefined || value === null) return 'N/A';
        if (formatter) return formatter(value);
        return value || 0;
    };

    return (<div className="mp-stats-section">
        <div className="mp-stats-grid">
            <div className="mp-stat-card">
                <div className="mp-stat-value">{safeValue(stats?.gamesPlayed)}</div>
                <div className="mp-stat-label">Số lần chơi</div>
            </div>
            <div className="mp-stat-card">
                <div className="mp-stat-value">{safeValue(stats?.highScore, val => val.toLocaleString())}</div>
                <div className="mp-stat-label">Điểm cao nhất</div>
            </div>
            <div className="mp-stat-card">
                <div className="mp-stat-value">{safeValue(stats?.rank, val => `#${val}`)}</div>
                <div className="mp-stat-label">Xếp hạng</div>
            </div>
            <div className="mp-stat-card">
                <div className="mp-stat-value">{safeValue(stats?.medals)}</div>
                <div className="mp-stat-label">Huy chương</div>
            </div>
        </div>
    </div>);
}

export default StatsSection;
