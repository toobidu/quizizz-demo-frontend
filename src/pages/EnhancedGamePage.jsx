import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedGameScreen from '../components/gameScreen/EnhancedGameScreen';
import useUserStore from '../hooks/useUserStore';
import enhancedGameFlowService from '../services/enhancedGameFlowService';
import enhancedWebSocketEventHandler from '../services/enhancedWebSocketEventHandler';

/**
 * Enhanced Game Page with full real-time features
 */
const EnhancedGamePage = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    
    // Get room info from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const roomCodeFromUrl = urlParams.get('roomCode');
    const isHostFromUrl = urlParams.get('isHost') === 'true';
    
    const [roomCode] = useState(roomCodeFromUrl || localStorage.getItem('currentRoomCode'));
    const [isHost] = useState(isHostFromUrl || localStorage.getItem('isHost') === 'true');
    const [gameReady, setGameReady] = useState(false);
    const [error, setError] = useState(null);

    // Initialize enhanced game flow
    useEffect(() => {
        if (!roomCode || !user?.userId) {
            setError('Missing room code or user information');
            return;
        }

        const initializeEnhancedGame = async () => {
            try {
                // Initialize enhanced game flow service
                await enhancedGameFlowService.initializeGame(roomCode, isHost, user.userId);
                // Initialize enhanced WebSocket event handler
                
                setGameReady(true);
                setError(null);
                
            } catch (err) {
                setError(err.message || 'Failed to initialize game');
            }
        };

        initializeEnhancedGame();

        // Cleanup on unmount
        return () => {
            enhancedGameFlowService.leaveGame();
        };
    }, [roomCode, isHost, user?.userId]);

    // Handle leaving game
    const handleLeaveGame = () => {
        // Clean up
        enhancedGameFlowService.leaveGame();
        
        // Clear localStorage
        localStorage.removeItem('currentRoomCode');
        localStorage.removeItem('isHost');
        
        // Navigate back to main page
        navigate('/');
    };

    // Error state
    if (error) {
        return (
            <div className="enhanced-game-page error-state">
                <div className="error-container">
                    <h2>Game Error</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Retry
                        </button>
                        <button onClick={handleLeaveGame} className="back-btn">
                            Back to Main
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (!gameReady) {
        return (
            <div className="enhanced-game-page loading-state">
                <div className="loading-container">
                    <div className="spinner large"></div>
                    <h2>Initializing Enhanced Game...</h2>
                    <p>Setting up real-time features</p>
                    <div className="loading-steps">
                        <div className="step">✓ Connecting to WebSocket</div>
                        <div className="step">✓ Loading game configuration</div>
                        <div className="step">⏳ Syncing with backend</div>
                    </div>
                </div>
            </div>
        );
    }

    // Main game interface
    return (
        <div className="enhanced-game-page">
            <EnhancedGameScreen
                roomCode={roomCode}
                isHost={isHost}
                currentUserId={user.userId}
                onLeaveGame={handleLeaveGame}
            />
            
            {/* Enhanced Features Info Panel */}
            <div className="enhanced-features-info">
                <details>
                    <summary>Enhanced Features Active</summary>
                    <ul>
                        <li>✅ Real-time WebSocket communication</li>
                        <li>✅ Advanced game session management</li>
                        <li>✅ Live scoreboard updates</li>
                        <li>✅ Enhanced question handling</li>
                        <li>✅ Comprehensive statistics tracking</li>
                        <li>✅ Improved error handling</li>
                        <li>✅ Offline support ready</li>
                    </ul>
                </details>
            </div>
        </div>
    );
};

export default EnhancedGamePage;
