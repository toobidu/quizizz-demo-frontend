import React from 'react';
import PropTypes from 'prop-types';
import '../../style/components/gameScreen/GameEndScreen.css';

/**
 * Màn hình kết thúc game
 */
const GameEndScreen = ({results, currentUserId}) => {
    // Sắp xếp kết quả theo thứ hạng
    const sortedResults = results ? [...results].sort((a, b) => a.rank - b.rank) : [];

    // Tìm người chơi hiện tại
    const currentPlayerResult = sortedResults.find(result => result.userId === currentUserId || result.id === currentUserId);

    return (<div className="game-end-screen">
        <div className="game-end-header">
            <h2>Kết quả trò chơi</h2>
            {currentPlayerResult && (<div className="your-result">
                <div className="your-rank">
                    Thứ hạng của bạn: <span>{currentPlayerResult.rank}</span>
                </div>
                <div className="your-score">
                    Điểm số: <span>{currentPlayerResult.score}</span>
                </div>
            </div>)}
        </div>

        <div className="leaderboard">
            <div className="leaderboard-header">
                <div className="rank-column">Hạng</div>
                <div className="player-column">Người chơi</div>
                <div className="score-column">Điểm</div>
                <div className="correct-column">Đúng</div>
                <div className="time-column">Thời gian</div>
            </div>

            <div className="leaderboard-body">
                {sortedResults.map((result) => (<div
                    key={result.userId || result.id}
                    className={`leaderboard-row ${(result.userId === currentUserId || result.id === currentUserId) ? 'current-player' : ''}`}
                >
                    <div className="rank-column">
                        {result.rank <= 3 ? (<div
                            className={`rank-badge rank-${result.rank}`}>{result.rank}</div>) : (result.rank)}
                    </div>
                    <div className="player-column">{result.username}</div>
                    <div className="score-column">{result.score}</div>
                    <div className="correct-column">{result.correctAnswers}</div>
                    <div className="time-column">{result.averageTime}s</div>
                </div>))}

                {sortedResults.length === 0 && (<div className="no-results">Không có kết quả nào</div>)}
            </div>
        </div>

        <div className="game-end-actions">
            <button className="play-again-button">Chơi lại</button>
            <button className="back-to-lobby-button">Quay lại phòng chờ</button>
        </div>
    </div>);
};

GameEndScreen.propTypes = {
    results: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        username: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
        rank: PropTypes.number.isRequired,
        correctAnswers: PropTypes.number.isRequired,
        averageTime: PropTypes.number.isRequired
    })), currentuserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

GameEndScreen.defaultProps = {
    results: []
};

export default GameEndScreen;
