import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  // Guard: Only set actualRoomCode if available
  const actualRoomCode = useMemo(() => roomId || roomCode, [roomId, roomCode]);
  const navigate = useNavigate();

  // State management
  const [newPlayerIds, setNewPlayerIds] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false); // Track if game start is in progress
  const [connectionAttempts, setConnectionAttempts] = useState(0); // Track reconnection attempts

  // ✅ REMOVED: roomJoined state - now using wsRoomJoined from hook

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

  // Only initialize WebSocket if actualRoomCode is valid
  const wsProps = useMemo(() => {
    if (!actualRoomCode) return null;
    return {
      roomCode: actualRoomCode,
      autoConnect: true,
      autoJoin: true
    };
  }, [actualRoomCode]);

  const {
    isConnected: wsConnected,
    isConnecting,
    roomJoined: wsRoomJoined, // ✅ Get roomJoined from hook
    send: sendMessage,
    sendSafely
  } = wsProps ? useUnifiedWebSocket(wsProps) : { isConnected: false, isConnecting: false, roomJoined: false, send: () => {}, sendSafely: () => {} };

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
        // ...existing code...
        setRoomInfo(roomData);

        // Load room details from store
        // ...existing code...
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
    // ...existing code...

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
        } else {
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
    // ...existing code...

    // Validate that this event is for our room
    if (data?.roomCode && data.roomCode !== actualRoomCode) {
      return;
    }

    // Reset starting state
    setIsStarting(false);

    // Update localStorage to indicate game has started
    localStorage.setItem('gameStarted', 'true');

    // Show notification
    showNotification('Game đã bắt đầu! Đang chuyển tới màn hình chơi...', 'success');

    // Navigate to game screen for all users (both host and players)
    const targetUrl = `/game/${actualRoomCode}`;
    navigate(targetUrl);
  }, [actualRoomCode, navigate, currentUserId, isHost]);

  const handleHeartbeatResponse = useCallback((data) => {
  }, []);

  const handleAllMessages = useCallback((data) => {
  }, []);

  // ✅ NEW: Handle room connection events
  const handleRoomConnectionSuccess = useCallback((data) => {
    setConnectionAttempts(0);
    showNotification('Đã kết nối thành công với phòng chơi', 'success');
  }, []);

  const handleRoomConnectionFailed = useCallback((data) => {
    showNotification('Không thể kết nối với phòng chơi. Đang thử lại...', 'error');
  }, []);

  const handleReconnectSuccess = useCallback((data) => {
    setConnectionAttempts(0);
    showNotification('Đã kết nối lại thành công', 'success');
  }, []);

  const handleReconnectFailed = useCallback((data) => {
    setConnectionAttempts(data.maxAttempts || 0);
    showNotification('Mất kết nối WebSocket. Vui lòng tải lại trang.', 'error');
  }, []);

  // ✅ NEW: Manual retry connection
  const handleRetryConnection = useCallback(() => {
    setConnectionAttempts(0);
    showNotification('Đang thử kết nối lại...', 'info');
    if (window.location) {
      window.location.reload();
    }
  }, []);

  // Room events object with enhanced event names and new handlers
  const roomEventHandlers = useMemo(() => {
    const handlers = {
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

      // ✅ NEW: Room connection events
      'room-connection-success': handleRoomConnectionSuccess,
      'room-connection-failed': handleRoomConnectionFailed,
      'reconnect-success': handleReconnectSuccess,
      'reconnect-failed': handleReconnectFailed,

      // Debug catch-all
      'message': handleAllMessages
    };

    return handlers;
  }, [
    actualRoomCode,
    currentUserId,
    isHost,
    handlePlayersUpdated,
    handlePlayerJoinedEvent,
    handlePlayerLeftEvent,
    handleHostChangedEvent,
    handleGameStartedEvent,
    handleHeartbeatResponse,
    handleAllMessages,
    handleRoomConnectionSuccess,
    handleRoomConnectionFailed,
    handleReconnectSuccess,
    handleReconnectFailed
  ]);

  // Register room events
  useRoomEvents(actualRoomCode, roomEventHandlers);
  useRoomEvents(actualRoomCode, roomEventHandlers);

  // ✅ ENHANCED: Dedicated GAME_STARTED listener with detailed logging
  // ✅ FIXED: Move hook call to top level (Rules of Hooks)
  const handleGameStartedDirect = useCallback((data) => {
    handleGameStartedEvent(data);
  }, [actualRoomCode, currentUserId, isHost, handleGameStartedEvent]);

  // ✅ FIXED: Call hook at top level
  useWebSocketEvent('game-started', handleGameStartedDirect, [actualRoomCode, currentUserId, isHost]);

  // ✅ DEBUG: Log listener attachment
  useEffect(() => {}, [actualRoomCode, currentUserId, isHost]);

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

  // Đảm bảo luôn gọi leaveRoom khi đóng tab hoặc reload trình duyệt
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await roomsApi.leaveRoom(actualRoomCode);
      } catch (e) {
        // ignore
      }
    };
    if (actualRoomCode) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      if (actualRoomCode) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [actualRoomCode]);

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

  // ✅ NEW: Monitor WebSocket connection when starting game
  useEffect(() => {
    if (isStarting && !wsConnected) {
      showNotification('Mất kết nối WebSocket. Game có thể không bắt đầu được.', 'warning');
      setIsStarting(false);
      localStorage.setItem('gameStarted', 'false');
    }
  }, [isStarting, wsConnected]);

  // ✅ NEW: Monitor room join status
  useEffect(() => {
    if (wsConnected && actualRoomCode && !wsRoomJoined) {
      // Set a timer to check if room join is taking too long
      const joinTimeout = setTimeout(() => {
        if (!wsRoomJoined) {
          showNotification('Đang kết nối với phòng chơi...', 'info');
        }
      }, 5000); // 5 seconds timeout
      return () => clearTimeout(joinTimeout);
    }
  }, [wsConnected, actualRoomCode, wsRoomJoined]);

  // ✅ NEW: Reset room joined status when WebSocket disconnects
  useEffect(() => {}, [wsConnected]);

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
      await roomsApi.leaveRoom(actualRoomCode);

      // Gọi API lấy lại danh sách player sau khi rời phòng
      const roomResponse = await roomsApi.getRoomByCode(actualRoomCode);
      let playersLeft = [];
      if (roomResponse && roomResponse.status === 200) {
        const roomData = roomResponse.data;
        const roomId = roomData.id || roomData.Id;
        if (roomId) {
          const playersResponse = await roomsApi.getPlayersInRoom(roomId);
          if (playersResponse && playersResponse.status === 200) {
            playersLeft = playersResponse.data || [];
          }
        }
      }

      // Nếu không còn ai trong phòng thì xóa phòng luôn
      if (!playersLeft || playersLeft.length === 0) {
        try {
          await roomsApi.deleteRoom(actualRoomCode);
        } catch (deleteError) {
          // Có thể log hoặc bỏ qua lỗi xóa phòng
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

  // ✅ FIXED: handleStartGame - Enhanced connection validation
  const handleStartGame = useCallback(async () => {
    if (!isHost || isStarting) return;

    // ✅ CRITICAL: Find actual host player to fix identity mismatch
    const actualHostPlayer = players.find(p => p.isHost);
    const actualHostUserId = actualHostPlayer?.userId;

    if (!actualHostUserId) {
      showNotification('Không tìm thấy thông tin host. Vui lòng tải lại trang.', 'error');
      return;
    }

    if (!wsConnected) {
      showNotification('WebSocket chưa kết nối. Game sẽ bắt đầu qua API.', 'info');
      // Don't return - allow game to start via API
    }
    if (!wsRoomJoined && wsConnected) {

      showNotification('Chưa join phòng thành công. Vui lòng đợi hoặc tải lại trang.', 'warning');
      return;
    }

    if (connectionAttempts > 5) { // Only block if many failed attempts
      showNotification('Kết nối không ổn định. Vui lòng đợi kết nối ổn định.', 'warning');
      return;
    }

    try {
      setIsStarting(true); // Set starting state

      // Verify room exists
      if (!roomInfo) {
        throw new Error('Room information not available. Please refresh the page.');
      }

      const roomCodeToUse = actualRoomCode || roomInfo.roomCode || roomInfo.RoomCode;
      if (!roomCodeToUse) {
        throw new Error('Room code is missing. Cannot start game.');
      }

      // Set up game data in localStorage
      const gameData = {
        roomCode: roomCodeToUse,
        roomInfo: roomInfo,
        hostId: actualHostUserId,
        isHost: isHost,
        players: players
      };

      localStorage.setItem('currentRoom', JSON.stringify(gameData));
      localStorage.setItem('gameStarted', 'pending'); // Set to pending until we receive game-started event

      // Get game settings from roomInfo
      const startGameData = {
        roomCode: roomCodeToUse,
        selectedTopicIds: roomInfo?.selectedTopics || roomInfo?.topicIds,
        questionCount: roomInfo?.questionCount || 10,
        timeLimit: roomInfo?.timeLimit || 30,
        hostId: actualHostUserId // ✅ FIXED: Use actual host ID for API call
      };

      // Use gameFlowService instead of direct WebSocket
      const gameFlowService = (await import('../../services/gameFlowService.js')).default;
      await gameFlowService.startGameDirect(
        roomCodeToUse,
        parseInt(actualHostUserId), // ✅ FIXED: Use actual host ID
        {
          selectedTopicIds: startGameData.selectedTopicIds,
          questionCount: startGameData.questionCount,
          timeLimit: startGameData.timeLimit
        }
      );
      showNotification('Đang bắt đầu game...', 'info');

      // No setTimeout fallback - we wait for the game-started event
      // If user doesn't receive event, they can manually retry by clicking button again

    } catch (error) {

      // Reset starting state on error
      setIsStarting(false);
      localStorage.setItem('gameStarted', 'false');

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
      showNotification(errorMessage, 'error');
    }
  }, [actualRoomCode, roomInfo, isHost, isStarting, players, navigate, currentUserId, wsConnected, wsRoomJoined, connectionAttempts]);

  const getMaxPlayers = useMemo(() => {
    if (!roomInfo) return 4;
    return roomInfo.maxPlayers || roomInfo.MaxPlayers || 4;
  }, [roomInfo]);

  const memoizedValues = useMemo(() => {

    // Tính toán canStartGame với debug logging
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
        {/* Connection Status Indicator */}
        <div className="connection-status">
          <div className={`status-indicator ${wsConnected && wsRoomJoined ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {wsConnected && wsRoomJoined ? 'Đã kết nối' :
                wsConnected ? 'Đang kết nối phòng...' : 'Đang kết nối...'}
            </span>
            {connectionAttempts > 0 && (
              <span className="reconnect-info">
                (Thử kết nối lại: {connectionAttempts})
              </span>
            )}
          </div>
          {(!wsConnected || !wsRoomJoined || connectionAttempts > 0) && (
            <button
              className="retry-connection-btn"
              onClick={handleRetryConnection}
              title="Thử kết nối lại"
            >
              🔄
            </button>
          )}
        </div>

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

        {/* ✅ FIXED: Action Buttons - Allow game start without requiring WebSocket */}
        {/* ✅ DEBUG: Log giá trị trước khi truyền cho ActionButtons */}
        {(() => {
          // ✅ FIXED: Only require canStartGame and !isStarting, WebSocket optional
          const finalCanStartGame = canStartGame && !isStarting;
          return null;
        })()}
        <ActionButtons
          isHost={isHost}
          canStartGame={canStartGame && !isStarting}
          players={players}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          isStarting={isStarting}
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
