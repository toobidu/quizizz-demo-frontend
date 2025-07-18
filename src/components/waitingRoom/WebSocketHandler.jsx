import { useEffect } from 'react';

const WebSocketHandler = ({ 
  wsConnected,
  actualRoomCode,
  initWebSocket,
  joinRoomWS,
  leaveRoomWS,
  setupWebSocketListeners,
  cleanupWebSocketListeners,
  onPlayersUpdate,
  onHostChange,
  onPlayerJoin,
  onPlayerLeave
}) => {
  // Initialize WebSocket connection
  useEffect(() => {
    console.log('[WAITING ROOM] WebSocket connection status:', wsConnected);

    // Initialize WebSocket if not connected
    if (!wsConnected) {
      console.log('[WAITING ROOM] Initializing WebSocket connection');
      initWebSocket();
    }

    // Join room via WebSocket when connected
    if (wsConnected) {
      console.log('[WAITING ROOM] Joining room via WebSocket:', actualRoomCode);
      joinRoomWS(actualRoomCode);

      // Setup WebSocket listeners
      setupWebSocketListeners();
    }

    return () => {
      // Leave room and cleanup listeners when component unmounts
      console.log('[WAITING ROOM] Leaving room via WebSocket:', actualRoomCode);
      leaveRoomWS(actualRoomCode);
      cleanupWebSocketListeners();
    };
  }, [actualRoomCode, wsConnected, initWebSocket, joinRoomWS, leaveRoomWS, setupWebSocketListeners, cleanupWebSocketListeners]);

  // Set up event listeners for real-time updates
  useEffect(() => {
    if (!wsConnected) return;

    // Force refresh players list every 3 seconds
    const refreshInterval = setInterval(() => {
      console.log('[WAITING ROOM] Auto-refreshing player list...');
      import('../../services/websocketService').then(({ default: websocketService }) => {
        websocketService.send('request-players-update', { roomCode: actualRoomCode });
      });
    }, 3000);

    // Import websocketService to listen for events
    import('../../services/websocketService').then(({ default: websocketService }) => {
      // Listen for ROOM_PLAYERS_UPDATED event
      const handleRoomPlayersUpdated = (data) => {
        console.log('[WAITING ROOM] Received ROOM_PLAYERS_UPDATED from WebSocket:', data);
        const eventData = data.Data || data;

        if (eventData.Players && Array.isArray(eventData.Players)) {
          // Map players from backend format to component format
          const mappedPlayers = eventData.Players.map(player => ({
            userId: player.UserId,
            username: player.Username,
            isHost: player.IsHost || false,
            isReady: player.Status === "ready",
            isOnline: player.Status !== "offline",
            joinTime: player.JoinTime
          }));

          onPlayersUpdate(mappedPlayers, eventData.Host);
        }
      };

      // Listen for ROOM_JOINED event
      const handleRoomJoined = (data) => {
        console.log('[WAITING ROOM] Received ROOM_JOINED from WebSocket:', data);
        const eventData = data.Data || data;

        if (eventData.IsHost !== undefined) {
          onHostChange(eventData.IsHost);
        }

        // Request players update when joining room
        websocketService.send('request-players-update', { roomCode: actualRoomCode });
      };

      // Listen for HOST_CHANGED event
      const handleHostChanged = (data) => {
        console.log('[WAITING ROOM] Received HOST_CHANGED from WebSocket:', data);
        const eventData = data.Data || data;
        onHostChange(eventData.NewHostId);
      };

      // Listen for PLAYER_LEFT event
      const handlePlayerLeft = (data) => {
        console.log('[WAITING ROOM] Received PLAYER_LEFT from WebSocket:', data);
        const eventData = data.Data || data;
        const userId = eventData.UserId || eventData.userId;
        const newHostId = eventData.NewHostId || eventData.newHostId;
        
        if (userId) {
          onPlayerLeave(userId, newHostId);
        }
      };

      // Listen for PLAYER_JOINED event
      const handlePlayerJoined = (data) => {
        console.log('[WAITING ROOM] Received PLAYER_JOINED from WebSocket:', data);
        const playerData = data.Data || data;
        
        const userId = playerData?.UserId || playerData?.userId || playerData?.Id || playerData?.id;
        const username = playerData?.Username || playerData?.username || playerData?.Name || playerData?.name;

        if (userId && username) {
          onPlayerJoin({
            userId,
            username,
            isHost: playerData.IsHost || playerData.isHost || false,
            isReady: playerData.IsReady || playerData.isReady || false
          });
        }
      };

      // Register event listeners
      websocketService.on('ROOM_PLAYERS_UPDATED', handleRoomPlayersUpdated);
      websocketService.on('room-players-updated', handleRoomPlayersUpdated);
      websocketService.on('ROOM_JOINED', handleRoomJoined);
      websocketService.on('room-joined', handleRoomJoined);
      websocketService.on('HOST_CHANGED', handleHostChanged);
      websocketService.on('host-changed', handleHostChanged);
      websocketService.on('PLAYER_LEFT', handlePlayerLeft);
      websocketService.on('player-left', handlePlayerLeft);
      websocketService.on('PLAYER_JOINED', handlePlayerJoined);
      websocketService.on('player-joined', handlePlayerJoined);

      // Request initial players update
      websocketService.send('request-players-update', { roomCode: actualRoomCode });

      // Cleanup function
      return () => {
        // Unregister event listeners
        websocketService.off('ROOM_PLAYERS_UPDATED', handleRoomPlayersUpdated);
        websocketService.off('room-players-updated', handleRoomPlayersUpdated);
        websocketService.off('ROOM_JOINED', handleRoomJoined);
        websocketService.off('room-joined', handleRoomJoined);
        websocketService.off('HOST_CHANGED', handleHostChanged);
        websocketService.off('host-changed', handleHostChanged);
        websocketService.off('PLAYER_LEFT', handlePlayerLeft);
        websocketService.off('player-left', handlePlayerLeft);
        websocketService.off('PLAYER_JOINED', handlePlayerJoined);
        websocketService.off('player-joined', handlePlayerJoined);
      };
    });

    // Cleanup interval when component unmounts
    return () => {
      clearInterval(refreshInterval);
    };
  }, [wsConnected, actualRoomCode, onPlayersUpdate, onHostChange, onPlayerJoin, onPlayerLeave]);

  // This is a utility component that doesn't render anything
  return null;
};

export default WebSocketHandler;