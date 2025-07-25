import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameContainer from '../../components/game/GameContainer';
import useUserStore from '../../hooks/useUserStore';
import gameFlowService from '../../services/gameFlowService';
import '../../style/pages/GamePage.css';
import '../../style/components/GameContainer.css';
import { showNotification } from '../../utils/notificationUtils';

/**
 * Game Page Component
 * Main page for playing the game with countdown, questions, and results
 * Updated to use backend API flow with GameContainer
 */
const GamePage = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { userName } = useUserStore();
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if current user is host and initialize game
    useEffect(() => {
        const initializeGame = async () => {
            try {
                if (!roomCode) {
                    navigate('/rooms');
                    return;
                }

                const currentUserId = localStorage.getItem('userId');
                if (!currentUserId) {
                    navigate('/rooms');
                    return;
                }

                // Get current room info to determine if user is host
                const roomData = JSON.parse(localStorage.getItem('currentRoom') || '{}');
                const gameStarted = localStorage.getItem('gameStarted');
                if (!roomData.roomCode) {
                    navigate('/rooms');
                    return;
                }
                
                if (roomData.roomCode !== roomCode) {
                    navigate('/rooms');
                    return;
                }

                // Check if game was started
                if (gameStarted !== 'true' && gameStarted !== 'pending') {
                    showNotification('Game chưa được bắt đầu', 'warning');
                    navigate(`/waiting-room/${roomCode}`);
                    return;
                }

                const userIsHost = roomData.hostId === currentUserId || roomData.isHost === true;
                setIsHost(userIsHost);
                setLoading(false);
            } catch (error) {
                setError('Không thể khởi tạo game. Vui lòng thử lại.');
                setLoading(false);
            }
        };

        initializeGame();
    }, [roomCode, navigate]);

    // Handle game end
    const handleGameEnd = (gameData) => {
        // Clean up localStorage
        localStorage.removeItem('gameStarted');
        
        // Show final notification
        showNotification('Game completed! Check your results.', 'success');
        
        // Auto-redirect to results or main page after 5 seconds
        setTimeout(() => {
            navigate('/rooms');
        }, 5000);
    };

    // Handle leaving game
    const handleLeaveGame = () => {
        // Clear game data
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('gameStarted');
        
        // Leave game via service
        gameFlowService.leaveGame();
        
        // Navigate back to rooms
        navigate('/rooms');
    };

    if (loading) {
        return (
            <div className="game-page loading">
                <div className="loading-container">
                    <h2>Loading Game...</h2>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="game-page error">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => navigate('/rooms')}
                        className="btn btn-primary"
                    >
                        Back to Rooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-page">
            <div className="game-header">
                <div className="room-info">
                    <h1>Room: {roomCode}</h1>
                    <p>Player: {userName}</p>
                    {isHost && <span className="host-badge">HOST</span>}
                </div>
                <button 
                    onClick={handleLeaveGame}
                    className="btn btn-secondary leave-btn"
                >
                    Leave Game
                </button>
            </div>

            <GameContainer 
                roomCode={roomCode}
                isHost={isHost}
                onGameEnd={handleGameEnd}
            />
        </div>
    );
};

export default GamePage;
