import {useEffect, useState} from 'react';
import unifiedWebSocketService from '../services/unifiedWebSocketService';
import eventEmitter from '../services/eventEmitter';

/**
 * Hook để quản lý trạng thái game
 * @param {string} roomCode - Mã phòng
 * @param {boolean} isHost - Có phải là host không
 * @returns {object} - Trạng thái và hàm tiện ích cho game
 */
const useGameState = (roomCode, isHost) => {
    // Trạng thái game
    const [gameState, setGameState] = useState('lobby'); // lobby, countdown, playing, ended
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [countdownValue, setCountdownValue] = useState(null);
    const [gameResults, setGameResults] = useState(null);
    const [playerProgress, setPlayerProgress] = useState({});
    const [allPlayersReady, setAllPlayersReady] = useState(false);

    // Kiểm tra xem tất cả người chơi đã sẵn sàng chưa
    useEffect(() => {
        if (!players.length) return;

        // Host luôn được coi là sẵn sàng
        const nonHostPlayers = players.filter(player => !player.isHost);
        const allReady = nonHostPlayers.every(player => player.isReady);

        setAllPlayersReady(allReady && nonHostPlayers.length > 0);
    }, [players]);

    // Lắng nghe các sự kiện game
    useEffect(() => {
        if (!roomCode) return;
        // Xử lý sự kiện countdown
        const handleCountdown = (data) => {
            setCountdownValue(data.value || data.countdownValue);
            setGameState('countdown');
        };

        // Xử lý sự kiện game bắt đầu
        const handleGameStarted = (data) => {
            setGameState('playing');
            setCountdownValue(null);
            setTotalQuestions(data.totalQuestions);
            setTimeRemaining(data.timeLimit);
        };

        // Xử lý sự kiện câu hỏi mới
        const handleNewQuestion = (data) => {
            setCurrentQuestion(data.question);
            setQuestionIndex(data.questionIndex);
            setTimeRemaining(data.timeRemaining);
            setGameState('question-active');
        };

        // Xử lý sự kiện cập nhật thời gian
        const handleTimerUpdate = (data) => {
            setTimeRemaining(data.timeRemaining);
        };

        // Xử lý sự kiện cập nhật tiến độ
        const handleProgressUpdate = (data) => {
            setPlayerProgress(data);
        };

        // Xử lý sự kiện game kết thúc
        const handleGameEnded = (data) => {
            setGameState('ended');
            setGameResults(data.finalResults);
        };

        // Xử lý sự kiện trạng thái người chơi thay đổi
        const handlePlayerStatusChanged = (data) => {
            setPlayers(prevPlayers => prevPlayers.map(player => player.userId === data.userId ? {
                ...player,
                isReady: data.status === 'ready'
            } : player));
        };

        // Xử lý sự kiện cập nhật danh sách người chơi
        const handlePlayersUpdated = (data) => {
            if (data.players) {
                setPlayers(data.players);
            }
        };

        // Đăng ký lắng nghe các sự kiện
        eventEmitter.on('countdown', handleCountdown);
        eventEmitter.on('game-started', handleGameStarted);
        eventEmitter.on('new-question', handleNewQuestion);
        eventEmitter.on('timer-update', handleTimerUpdate);
        eventEmitter.on('progress-update', handleProgressUpdate);
        eventEmitter.on('game-ended', handleGameEnded);
        eventEmitter.on('player-status-changed', handlePlayerStatusChanged);
        eventEmitter.on('room-players-updated', handlePlayersUpdated);

        // Cleanup khi unmount
        return () => {
            eventEmitter.off('countdown', handleCountdown);
            eventEmitter.off('game-started', handleGameStarted);
            eventEmitter.off('new-question', handleNewQuestion);
            eventEmitter.off('timer-update', handleTimerUpdate);
            eventEmitter.off('progress-update', handleProgressUpdate);
            eventEmitter.off('game-ended', handleGameEnded);
            eventEmitter.off('player-status-changed', handlePlayerStatusChanged);
            eventEmitter.off('room-players-updated', handlePlayersUpdated);
        };
    }, [roomCode]);

    // Hàm để cập nhật trạng thái sẵn sàng của người chơi
    const toggleReady = (ready) => {
        unifiedWebSocketService.send('player-ready', {
            roomCode, ready
        });
    };

    // Hàm để bắt đầu game (chỉ host)
    const startGame = () => {
        if (!isHost) return;
        unifiedWebSocketService.send('start-game', {roomCode});
    };

    // Hàm để gửi câu trả lời
    const submitAnswer = (answer, timeTaken) => {
        // Import dynamically để tránh circular dependency
        import('../services/gameFlowService').then(({ default: gameFlowService }) => {
            gameFlowService.submitAnswer(questionIndex, answer, Date.now());
        });
    };

    return {
        gameState,
        players,
        currentQuestion,
        questionIndex,
        totalQuestions,
        timeRemaining,
        countdownValue,
        gameResults,
        playerProgress,
        allPlayersReady,
        toggleReady,
        startGame,
        submitAnswer
    };
};

export default useGameState;
