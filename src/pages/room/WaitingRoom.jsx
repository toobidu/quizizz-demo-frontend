import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { showNotification } from '../../utils/notificationUtils';
import '../../style/components/Notification.css';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../layouts/Header.jsx';
import Footer from '../../layouts/Footer.jsx';
import topicsApi from '../../config/api/topics.api.js';
import roomsApi from '../../config/api/roomsList.api.js';
import useRoomStore from '../../stores/useRoomStore.js';
import useRealtimeUIStore from '../../stores/useRealtimeUIStore.js';
import '../../style/pages/room/WaitingRoom.css';
import '../../style/components/PlayerEffects.css';
import RoomHeader from '../../components/waitingRoom/RoomHeader.jsx';
import RoomCodeCard from '../../components/waitingRoom/RoomCodeCard.jsx';
import RoomInfoGrid from '../../components/waitingRoom/RoomInfoGrid.jsx';
import PlayersList from '../../components/waitingRoom/PlayersList.jsx';
import ActionButtons from '../../components/waitingRoom/ActionButtons.jsx';
import LoadingState from '../../components/waitingRoom/LoadingState.jsx';
import ErrorState from '../../components/waitingRoom/ErrorState.jsx';
import NotificationContainer from '../../components/common/NotificationContainer.jsx';
import PlayerJoinAnimation from '../../components/waitingRoom/PlayerJoinAnimation.jsx';
import { useUnifiedWebSocket, useWebSocketEvent, useRoomEvents } from '../../hooks/useUnifiedWebSocket';

const WaitingRoom = ({ roomId }) => {
  const { roomCode } = useParams();
  const actualRoomCode = roomId || roomCode;
  const navigate = useNavigate();

  // State management
  const [newPlayerIds, setNewPlayerIds] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get state from stores
  const {
    players,
    isHost,
    setIsHost,
    removePlayer,
    loadRoomDetails,
    getCurrentUserId,
    setPlayers,
    addPlayer
  } = useRoomStore();

  // ✅ NEW: Real-time UI store for animations and notifications
  const {
    activeAnimations,
    handlePlayerJoinedRealtime,
    handlePlayerLeftRealtime,
    isPlayerNew,
    updateConnectionState,
    clearAllAnimations
  } = useRealtimeUIStore();
  
  // ✅ FIXED: Use unified WebSocket service
  const { 
    isConnected: wsConnected, 
    isConnecting,
    send: sendMessage,
    sendSafely
  } = useUnifiedWebSocket({
    roomCode: actualRoomCode,
    autoConnect: true,
    autoJoin: true
  });
  
  const currentUserId = useMemo(() => getCurrentUserId(), [getCurrentUserId]);
  
  useEffect(() => {
    if (currentUserId && !localStorage.getItem('userId')) {
      localStorage.setItem('userId', currentUserId.toString());
    }
  }, [currentUserId]);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // Load topics
      const topicsResponse = await topicsApi.getAllTopics();
      if (topicsResponse && (topicsResponse.status === 200)) {
        const topicsData = topicsResponse.data || [];
        const normalizedTopics = topicsData.map(topic => ({
          id: topic.Id || topic.id,
          name: topic.Name || topic.name
        }));
        setTopics(normalizedTopics);
      }

      // Load room data
      const roomResponse = await roomsApi.getRoomByCode(actualRoomCode);

      if (roomResponse && (roomResponse.status === 200)) {
        const roomData = roomResponse.data;
        setRoomInfo(roomData);

        // Load room details from store
        loadRoomDetails(actualRoomCode);

        // Ensure user is joined to room
        const roomId = roomData.id || roomData.Id;
        if (roomId) {
          const playersResponse = await roomsApi.getPlayersInRoom(roomId);
          if (playersResponse && playersResponse.status === 200) {
            const playersData = playersResponse.data || [];
            const userInRoom = playersData.find(p => 
              p.userId?.toString() === currentUserId?.toString()
            );
            
            if (!userInRoom && currentUserId) {
              try {
                const joinResponse = await roomsApi.joinRoomByCode(actualRoomCode);
                if (joinResponse.status === 200) {
                  setTimeout(() => loadRoomDetails(actualRoomCode), 1000);
                }
              } catch (joinError) {
              }
            }
          }
        }
      } else {
        throw new Error(roomResponse.message || 'Room not found');
      }
    } catch (error) {
      setRoomInfo(null);
    } finally {
      setLoading(false);
    }
  }, [actualRoomCode, loadRoomDetails, currentUserId]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ FIXED: Xử lý khi có người chơi mới tham gia
  const handlePlayerJoin = useCallback((newPlayer) => {
    showNotification(`${newPlayer.username} đã tham gia phòng!`, 'success');

    setNewPlayerIds(ids => {
      if (!ids.includes(newPlayer.userId)) {
        return [...ids, newPlayer.userId];
      }
      return ids;
    });

    setTimeout(() => {
      setNewPlayerIds(ids => ids.filter(id => id !== newPlayer.userId));
    }, 3000);
  }, []);

  // ✅ FIXED: Xử lý khi có người chơi rời phòng - Remove dynamic import
  const handlePlayerLeave = useCallback((userId, newHostId) => {
    const leavingPlayer = players.find(p =>
      p.userId === userId ||
      p.userId?.toString() === userId?.toString()
    );

    if (leavingPlayer) {
      showNotification(`${leavingPlayer.username} đã rời phòng!`, 'warning');
      removePlayer(userId);
    }

    // ✅ FIXED: Use unified service instead of dynamic import
    setTimeout(() => {
      if (wsConnected) {
        sendMessage('request-players-update', { roomCode: actualRoomCode });
      }
    }, 500);

  }, [players, actualRoomCode, removePlayer, wsConnected, sendMessage]);

  // ✅ ENHANCED: Event handlers with better logging and real-time UI updates
  const handlePlayersUpdated = useCallback((data) => {
    try {
      if (data.players && Array.isArray(data.players)) {
        // Smooth transition for players list
        setPlayers(data.players);
        
        // Update host status based on players list
        const currentUser = data.players.find(p => 
          p.userId?.toString() === currentUserId?.toString()
        );
        if (currentUser) {
          setIsHost(currentUser.isHost || false);
        }
        
      } else {
        loadRoomDetails(actualRoomCode);
      }
    } catch (error) {
      loadRoomDetails(actualRoomCode);
    }
  }, [setPlayers, setIsHost, currentUserId, loadRoomDetails, actualRoomCode]);

  // ✅ ENHANCED: Helper function to add animation using store
  const addAnimation = useCallback((type, playerId, playerName) => {
    if (type === 'join') {
      handlePlayerJoinedRealtime(playerId, playerName);
    } else if (type === 'leave') {
      handlePlayerLeftRealtime(playerId, playerName);
    }
  }, [handlePlayerJoinedRealtime, handlePlayerLeftRealtime]);

  const handlePlayerJoinedEvent = useCallback((data) => {
    
    try {
      const playerName = data.player?.username || data.username || data.name || 'Someone';
      
      if (data.player) {
        const newPlayerId = data.player.userId || data.player.id;
        if (newPlayerId && newPlayerId.toString() !== currentUserId?.toString()) {
          // Only show animation for other players, not self
          addAnimation('join', newPlayerId, playerName);
        }
      }

      if (data.player) {
        const newPlayerId = data.player.userId || data.player.id;
        if (newPlayerId) {
          setNewPlayerIds(prev => {
            if (!prev.includes(newPlayerId)) {
              return [...prev, newPlayerId];
            }
            return prev;
          });

          // Remove from new players list after animation
          setTimeout(() => {
            setNewPlayerIds(prev => prev.filter(id => id !== newPlayerId));
          }, 3000);
        }
      }

      // Update players list
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        
        // Update host status
        const currentUser = data.players.find(p => 
          p.userId?.toString() === currentUserId?.toString()
        );
        if (currentUser) {
          setIsHost(currentUser.isHost || false);
        }
      } else if (data.player) {
        addPlayer(data.player);
      } else {
        setTimeout(() => loadRoomDetails(actualRoomCode), 500);
      }

      // ✅ REMOVED: Manual request as backend now auto-sends updates
    } catch (error) {
      loadRoomDetails(actualRoomCode);
    }
  }, [setPlayers, setIsHost, addPlayer, currentUserId, setNewPlayerIds, addAnimation, loadRoomDetails, actualRoomCode]);

  const handlePlayerLeftEvent = useCallback((data) => {
    
    try {
      let leavingPlayerName = 'Someone';
      
      // Find leaving player from current players list
      const leavingPlayer = players.find(p => 
        p.userId?.toString() === data.userId?.toString()
      );
      
      if (leavingPlayer) {
        leavingPlayerName = leavingPlayer.username;
        
        addAnimation('leave', data.userId, leavingPlayerName);
      } else {
        showNotification(`👋 ${leavingPlayerName} đã rời phòng!`, 'warning');
      }
      
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        
        // Update host status based on new players list
        const currentUser = data.players.find(p => 
          p.userId?.toString() === currentUserId?.toString()
        );
        if (currentUser) {
          setIsHost(currentUser.isHost || false);
        }
      } else {
        removePlayer(data.userId);
        
        // Refresh after local update
        setTimeout(() => loadRoomDetails(actualRoomCode), 500);
      }
      
    } catch (error) {
      loadRoomDetails(actualRoomCode);
    }
  }, [players, setPlayers, setIsHost, removePlayer, currentUserId, addAnimation, loadRoomDetails, actualRoomCode]);

  const handleHostChangedEvent = useCallback((data) => {
    
    try {
      const isNewHost = data.newHostId?.toString() === currentUserId?.toString();
      
      
      // Show notification with better styling
      if (isNewHost) {
        showNotification('👑 Bạn đã trở thành chủ phòng mới!', 'info');
      } else {
        const newHostPlayer = players.find(p => 
          p.userId?.toString() === data.newHostId?.toString()
        );
        if (newHostPlayer) {
          showNotification(`👑 ${newHostPlayer.username} đã trở thành chủ phòng mới!`, 'info');
        }
      }
      
      // Update players list with new host status
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        
        // Double-check host status from players list
        const currentUser = data.players.find(p => 
          p.userId?.toString() === currentUserId?.toString()
        );
        if (currentUser) {
          setIsHost(currentUser.isHost || false);
        }
      } else {
        // Fallback: Update players list to reflect host change
        setTimeout(() => loadRoomDetails(actualRoomCode), 500);
      }
    } catch (error) {
      // Fallback to refresh room data
      loadRoomDetails(actualRoomCode);
    }
  }, [currentUserId, setIsHost, players, setPlayers, loadRoomDetails, actualRoomCode]);

  const handleGameStartedEvent = useCallback((data) => {
    console.log('🎮 [WAITING_ROOM] === GAME STARTED EVENT RECEIVED ===');
    console.log('🎮 [WAITING_ROOM] Timestamp:', new Date().toISOString());
    console.log('🎮 [WAITING_ROOM] Event data:', data);
    console.log('🎮 [WAITING_ROOM] Current user ID:', currentUserId);
    console.log('🎮 [WAITING_ROOM] Is host:', isHost);
    console.log('🎮 [WAITING_ROOM] Actual room code:', actualRoomCode);
    
    // Check if user should navigate to game
    const shouldNavigate = true; // All users should navigate when game starts
    console.log('🎮 [WAITING_ROOM] Should navigate:', shouldNavigate);
    
    if (shouldNavigate) {
      console.log('🎮 [WAITING_ROOM] 💾 Setting gameStarted flag in localStorage');
      localStorage.setItem('gameStarted', 'true');
      const targetUrl = `/game/${actualRoomCode}`;
      console.log('🎮 [WAITING_ROOM] 🚀 Navigating to:', targetUrl);
      navigate(targetUrl);
    } else {
      console.log('🎮 [WAITING_ROOM] ⚠️ Navigation skipped');
    }
  }, [actualRoomCode, navigate, currentUserId, isHost]);

  const handleHeartbeatResponse = useCallback((data) => {
  }, []);

  const handleAllMessages = useCallback((data) => {
  }, []);

  // Room events object with enhanced event names and new handlers
  const roomEventHandlers = useMemo(() => ({
    // Primary event names (matching backend exactly)
    'players-updated': handlePlayersUpdated,
    'player-joined': handlePlayerJoinedEvent,
    'player-left': handlePlayerLeftEvent,
    'host-changed': handleHostChangedEvent,
    'game-started': handleGameStartedEvent,
    'heartbeat': handleHeartbeatResponse,

    // Alternative/legacy event names for compatibility
    'room-players-updated': handlePlayersUpdated,
    'user-joined': handlePlayerJoinedEvent,
    'user-left': handlePlayerLeftEvent,
    'new-host': handleHostChangedEvent,

    // Debug catch-all
    'message': handleAllMessages
  }), [
    handlePlayersUpdated, 
    handlePlayerJoinedEvent, 
    handlePlayerLeftEvent, 
    handleHostChangedEvent, 
    handleGameStartedEvent,
    handleHeartbeatResponse,
    handleAllMessages
  ]);

  // Register room events
  useRoomEvents(actualRoomCode, roomEventHandlers);

  // Xử lý khi đóng trình duyệt hoặc tải lại trang
  React.useEffect(() => {
    if (!actualRoomCode) return;

    const handleBeforeUnload = (e) => {
      // Đặt cờ để biết rằng người dùng đã đóng trình duyệt
      localStorage.setItem('closedBrowser', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [actualRoomCode]);

  // Xử lý khi đóng trình duyệt hoặc tải lại trang

  // Chỉ chạy một lần khi component được mount
  useEffect(() => {
    // Lưu mã phòng hiện tại
    if (actualRoomCode) {
      localStorage.setItem('currentRoomCode', actualRoomCode);

      // Kiểm tra xem có cần tham gia lại phòng không
      const needsRejoin = localStorage.getItem('needsRejoin') === 'true';
      if (needsRejoin) {
        localStorage.removeItem('needsRejoin');

        // Chỉ gửi yêu cầu tham gia lại nếu WebSocket đã kết nối
        if (wsConnected) {
          sendMessage('join-room', { 
            roomCode: actualRoomCode,
            userId: currentUserId 
          });
        }
      }
    }

    // Khi component bị hủy nhưng không phải do rời phòng có chủ đích
    return () => {
      if (actualRoomCode) {
        localStorage.setItem('needsRejoin', 'true');
      }
    };
  }, [actualRoomCode, wsConnected, sendMessage, currentUserId]);

  // ✅ ENHANCED: Update connection state in store
  useEffect(() => {
    updateConnectionState({
      isConnected: wsConnected,
      isConnecting: isConnecting,
      lastHeartbeat: wsConnected ? Date.now() : null
    });
  }, [wsConnected, isConnecting, updateConnectionState]);

  // ✅ ENHANCED: Cleanup animations on unmount
  useEffect(() => {
    return () => {
      clearAllAnimations();
    };
  }, [clearAllAnimations]);

  // ✅ ENHANCED: Optimized heartbeat with backend response handling
  useEffect(() => {
    if (!actualRoomCode || !wsConnected) return;

    // Send heartbeat every 30 seconds (backend timeout is 120s, so this is safe)
    const heartbeatInterval = setInterval(() => {
      
      // Update connection state
      updateConnectionState({ lastHeartbeat: Date.now() });
    }, 30000); // 30 seconds

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [actualRoomCode, wsConnected, currentUserId, sendMessage, updateConnectionState]);

  useEffect(() => {
    if (wsConnected && actualRoomCode) {
      const fallbackTimer = setTimeout(() => {
        if (players.length === 0) {
          sendMessage('request-players-update', { roomCode: actualRoomCode });
        }
      }, 3000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [wsConnected, actualRoomCode, players.length, sendMessage]);

  useEffect(() => {
    if (!actualRoomCode || !wsConnected) return;

    // Less frequent sync since backend now auto-sends updates
    const syncInterval = setInterval(() => {
      sendMessage('request-players-update', { roomCode: actualRoomCode });
    }, 60000); // Every 60 seconds (reduced from 15s)

    return () => clearInterval(syncInterval);
  }, [actualRoomCode, wsConnected, sendMessage]); 

  const handleLeaveRoom = useCallback(async () => {
    try {
      // Xóa cờ tham gia lại và mã phòng để tránh tự động tham gia lại
      localStorage.removeItem('needsRejoin');
      localStorage.removeItem('currentRoomCode');
      localStorage.removeItem('pendingRejoin');

      sendMessage('player-left', {
        roomCode: actualRoomCode,
        userId: currentUserId
      });

      sendMessage('leave-room', {
        roomCode: actualRoomCode,
        userId: currentUserId
      });

      sendMessage('request-players-update', { roomCode: actualRoomCode });

      // Gọi API rời phòng
      const response = await roomsApi.leaveRoom(actualRoomCode);

      // Kiểm tra xem có nên xóa phòng không (nếu là host và chỉ có 1 người chơi)
      if (isHost && players.length <= 1) {
        try {
          const deleteResponse = await roomsApi.deleteRoom(actualRoomCode);
        } catch (deleteError) {
        }
      }

      // Chuyển hướng về trang danh sách phòng
      navigate('/rooms');

    } catch (error) {
      // Vẫn xóa mã phòng ngay cả khi có lỗi
      localStorage.removeItem('currentRoomCode');
      localStorage.removeItem('needsRejoin');
      localStorage.removeItem('pendingRejoin');
      navigate('/rooms');
    }
  }, [actualRoomCode, isHost, players.length, navigate, currentUserId, sendMessage]);

  // ✅ FIXED: handleStartGame với debug logs
  const handleStartGame = useCallback(async () => {
    console.log('🎮 [WAITING_ROOM] === START GAME BUTTON CLICKED ===');
    console.log('🎮 [WAITING_ROOM] Timestamp:', new Date().toISOString());
    console.log('🎮 [WAITING_ROOM] Current user ID:', currentUserId);
    console.log('🎮 [WAITING_ROOM] Is host:', isHost);
    console.log('🎮 [WAITING_ROOM] Actual room code:', actualRoomCode);
    console.log('🎮 [WAITING_ROOM] Room info:', roomInfo);
    console.log('🎮 [WAITING_ROOM] Players:', players);
    console.log('🎮 [WAITING_ROOM] Can start game:', canStartGame);

    let roomCodeToUse = null;
    
    try {
      // Verify room exists by checking room info
      if (!roomInfo) {
        console.log('🎮 [WAITING_ROOM] ❌ No room info available');
        throw new Error('Room information not available. Please refresh the page.');
      }

      // Double-check room code
      roomCodeToUse = actualRoomCode || roomInfo.roomCode || roomInfo.RoomCode;
      console.log('🎮 [WAITING_ROOM] Room code to use:', roomCodeToUse);
      
      if (!roomCodeToUse) {
        console.log('🎮 [WAITING_ROOM] ❌ No room code found');
        throw new Error('Room code is missing. Cannot start game.');
      }
      
      // Verify room still exists in backend before starting game
      console.log('🎮 [WAITING_ROOM] 📤 Verifying room exists in backend...');
      const verifyRoomResponse = await roomsApi.getRoomByCode(roomCodeToUse);
      console.log('🎮 [WAITING_ROOM] 📥 Room verification response:', verifyRoomResponse);
      
      if (!verifyRoomResponse || verifyRoomResponse.status !== 200) {
        console.log('🎮 [WAITING_ROOM] ❌ Room verification failed');
        throw new Error('Phòng không tồn tại hoặc đã bị xóa. Vui lòng tạo phòng mới.');
      }
      
      // Set up game data in localStorage before starting
      const gameData = {
        roomCode: roomCodeToUse,
        roomInfo: roomInfo,
        hostId: currentUserId,
        isHost: isHost,
        players: players
      };
      
      console.log('🎮 [WAITING_ROOM] 💾 Saving game data to localStorage:', gameData);
      localStorage.setItem('currentRoom', JSON.stringify(gameData));
      localStorage.setItem('gameStarted', 'true');

      // Get selected topics from roomInfo if available
      const selectedTopicIds = roomInfo?.selectedTopics || roomInfo?.topicIds;
      const questionCount = roomInfo?.questionCount;
      const timeLimit = roomInfo?.timeLimit;

      const startGameData = {
        roomCode: roomCodeToUse,
        selectedTopicIds: selectedTopicIds,
        questionCount: questionCount,
        timeLimit: timeLimit,
        hostId: currentUserId,
        isHost: isHost
      };

      console.log('🎮 [WAITING_ROOM] 📤 Sending start-game message via WebSocket:', startGameData);

      // Use unified service
      console.log('🎮 [WAITING_ROOM] 📤 Calling sendSafely with start-game event...');
      await sendSafely('start-game', startGameData);
      console.log('🎮 [WAITING_ROOM] ✅ start-game message sent successfully');
      
      // Show success notification
      showNotification('Game đã bắt đầu! Đang chuyển sang màn hình chơi...', 'success');

      // Fallback navigation after 5 seconds
      console.log('🎮 [WAITING_ROOM] ⏰ Setting fallback navigation timer...');
      setTimeout(() => {
        const gameStarted = localStorage.getItem('gameStarted');
        console.log('🎮 [WAITING_ROOM] ⏰ Fallback timer triggered, gameStarted flag:', gameStarted);
        if (gameStarted === 'true' && isHost) {
          console.log('🎮 [WAITING_ROOM] 🚀 Fallback navigation to game page');
          navigate(`/game/${roomCodeToUse}`);
        }
      }, 5000);

    } catch (error) {
      console.log('🎮 [WAITING_ROOM] ❌ Error in handleStartGame:', error);
      console.log('🎮 [WAITING_ROOM] Error message:', error.message);
      console.log('🎮 [WAITING_ROOM] Error status:', error.status);
      console.log('🎮 [WAITING_ROOM] Error errorCode:', error.errorCode);
      
      // More specific error messages
      let errorMessage = 'Không thể bắt đầu game. Vui lòng thử lại!';
      
      if (error.message?.includes('WebSocket connection timeout')) {
        errorMessage = 'Mất kết nối WebSocket. Vui lòng kiểm tra internet và thử lại.';
      } else if (error.errorCode === 'ROOM_NOT_FOUND' || error.message?.includes('không tồn tại')) {
        errorMessage = 'Phòng không tồn tại hoặc đã bị xóa. Vui lòng tạo phòng mới.';
      } else if (error.status === 401) {
        errorMessage = 'Bạn không có quyền bắt đầu game. Chỉ chủ phòng mới có thể bắt đầu.';
      } else if (error.status === 400) {
        errorMessage = 'Thông tin game không hợp lệ. Vui lòng kiểm tra cài đặt phòng.';
      }
      
      console.log('🎮 [WAITING_ROOM] Error message to show:', errorMessage);
      showNotification(errorMessage, 'error');
    }
  }, [actualRoomCode, roomInfo, isHost, players, navigate, currentUserId, sendSafely]);

  const getMaxPlayers = useMemo(() => {
    if (!roomInfo) return 4;
    return roomInfo.maxPlayers || roomInfo.MaxPlayers || 4;
  }, [roomInfo]);

  const memoizedValues = useMemo(() => {
    
    // Tính toán canStartGame
    const nonHostPlayers = players.filter(p => !p.isHost);
    const allNonHostPlayersReady = nonHostPlayers.every(p => p.isReady);
    
    const canStartGame = isHost && nonHostPlayers.length >= 1 && allNonHostPlayersReady;
    
    const maxPlayers = getMaxPlayers;
    const hostPlayer = players.find(p => p.isHost);

    return {
      canStartGame,
      maxPlayers,
      hostPlayer
    };
  }, [isHost, players, getMaxPlayers, currentUserId]);

  const { canStartGame, maxPlayers, hostPlayer } = memoizedValues;

  if (loading) {
    return (
      <div className="waiting-room">
        <Header />
        <div className="waiting-container">
          <LoadingState />
        </div>
        <Footer />
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="waiting-room">
        <Header />
        <div className="waiting-container">
          <ErrorState onNavigateBack={() => navigate('/rooms')} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="waiting-room">
      <Header />
      <NotificationContainer />

      {/* WebSocket Handler */}
      {/* ✅ REMOVED: WebSocketHandler - using unified hooks instead */}

      <div className="waiting-container">
        {/* Room Header */}
        <div className="room-header">
          <RoomHeader
            title={roomInfo?.roomName || roomInfo?.RoomName}
          />
          <RoomCodeCard roomCode={actualRoomCode} />
        </div>

        {/* Room Info */}
        <RoomInfoGrid
          roomInfo={roomInfo}
          topics={topics}
          maxPlayers={maxPlayers}
        />

        {/* Players Section */}
        <PlayersList
          players={players}
          newPlayerIds={newPlayerIds}
          maxPlayers={maxPlayers}
          host={hostPlayer}
          currentUserId={currentUserId}
        />

        {/* ✅ FIXED: Action Buttons - Chỉ dựa vào isHost từ store */}
        <ActionButtons
          isHost={isHost}
          canStartGame={canStartGame}
          players={players}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>

      {/* ✅ NEW: Player Join/Leave Animations */}
      {activeAnimations.map(animation => (
        <PlayerJoinAnimation
          key={animation.id}
          playerId={animation.playerId}
          playerName={animation.playerName}
          type={animation.type}
        />
      ))}

      <Footer />
    </div>
  );
};

export default WaitingRoom;
