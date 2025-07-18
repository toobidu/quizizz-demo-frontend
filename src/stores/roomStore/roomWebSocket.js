import websocketService from '../../services/websocketService';

const roomWebSocket = (set, get) => ({
  // WebSocket connection state
  wsConnected: false,

  // Initialize WebSocket connection
  initWebSocket: () => {
    try {
      // Unregister all old listeners before new connection
      get().disconnectWebSocket();

      // Connect to WebSocket
      websocketService.connect();

      // Check connection and setup if needed
      const checkConnection = () => {
        if (!websocketService.isConnected) {
          console.log('[WEBSOCKET] Connection not established, reconnecting...');
          websocketService.connect();
          return false;
        }
        return true;
      };

      // Check connection after 1 second
      setTimeout(() => {
        const isConnected = checkConnection();
        if (isConnected) {
          console.log('[WEBSOCKET] Connection established, setting up listeners');
          // Setup listeners for WebSocket events
          get().setupWebSocketListeners();
          set({ wsConnected: true });
        } else {
          // Try again after 2 seconds if connection not established
          setTimeout(() => {
            const retryConnected = checkConnection();
            if (retryConnected) {
              console.log('[WEBSOCKET] Connection established on retry, setting up listeners');
              get().setupWebSocketListeners();
              set({ wsConnected: true });
            } else {
              console.warn('[WEBSOCKET] Failed to establish connection after retry');
            }
          }, 2000);
        }
      }, 1000);

      // Listen for player-left event to remove player from list - new format
      websocketService.off('player-left'); // Unregister before registering
      websocketService.on('player-left', (message) => {
        // Get data from new format
        const { Type, Data, Timestamp } = message;

        console.log('[STORE] PLAYER-LEFT EVENT:', { Type, Data, Timestamp });

        // Check message format
        if (!Data || !Data.UserId) {
          console.log('Store: Invalid player-left data, missing UserId', message);
          return;
        }

        const userId = Data.UserId;
        const username = Data.Username;

        // Remove player from list
        set((state) => ({
          players: state.players.filter(player =>
            player.userId !== userId &&
            player.UserId !== userId &&
            player.id !== userId &&
            player.Id !== userId
          )
        }));

        // Emit event to eventEmitter for components to listen
        import('../../services/eventEmitter').then(({ default: eventEmitter }) => {
          eventEmitter.emit('player-left', {
            userId,
            username
          });
        }).catch(err => console.error('Error importing eventEmitter:', err));
      });

      // Listen for host-changed event - new format
      websocketService.off('host-changed');
      websocketService.on('host-changed', (message) => {
        // Get data from new format
        const { Type, Data, Timestamp } = message;

        console.log('[WEBSOCKET] Chủ phòng thay đổi:', { Type, Data, Timestamp });

        // Check message format
        if (!Data || !Data.NewHostId) {
          console.log('⚠️ Store: Invalid host-changed data, missing NewHostId', message);
          return;
        }

        const { currentRoom } = get();
        const currentUserId = get().getCurrentUserId();
        const newHostId = Data.NewHostId;
        const newHost = Data.NewHost;
        const notificationMessage = Data.Message;

        if (currentRoom && newHostId) {
          const isNewHost = parseInt(newHostId) === parseInt(currentUserId);
          set({ isHost: isNewHost });

          if (notificationMessage) {
            console.log('[NOTIFICATION]', notificationMessage);
          }

          // Emit event to eventEmitter for components to listen
          import('../../services/eventEmitter').then(({ default: eventEmitter }) => {
            eventEmitter.emit('host-changed', {
              newHostId,
              newHost,
              message: notificationMessage
            });
          }).catch(err => console.error('Error importing eventEmitter:', err));
        }
      });

      // Listen for room-joined event
      websocketService.off('room-joined');
      websocketService.on('room-joined', (message) => {
        // Get data from new format
        const { Type, Data, Timestamp } = message;

        console.log('[WEBSOCKET] Tham gia phòng thành công:', { Type, Data, Timestamp });

        // Check message format
        if (!Data) {
          console.log('⚠️ Store: Invalid room-joined data', message);
          return;
        }

        const roomCode = Data.RoomCode;
        const isHost = Data.IsHost;
        const notificationMessage = Data.Message;

        // Update host status if available
        if (isHost !== undefined) {
          set({ isHost });
        }

        if (notificationMessage) {
          console.log('[NOTIFICATION]', notificationMessage);
        }

        // Emit event to eventEmitter for components to listen
        import('../../services/eventEmitter').then(({ default: eventEmitter }) => {
          eventEmitter.emit('room-joined', {
            roomCode,
            isHost,
            message: notificationMessage
          });
        }).catch(err => console.error('Error importing eventEmitter:', err));
      });

      // Listen for room events
      websocketService.off('room-created');
      websocketService.on('room-created', (data) => {
        console.log('[WEBSOCKET] Phòng mới được tạo qua WebSocket:', data);
        // Refresh room list to show new room
        get().loadRooms(true);
      });

      websocketService.off('ROOM_CREATED');
      websocketService.on('ROOM_CREATED', (data) => {
        console.log('[WEBSOCKET] ROOM_CREATED event:', data);
        get().loadRooms(true);
      });

      websocketService.off('room-deleted');
      websocketService.on('room-deleted', (data) => {
        console.log('[WEBSOCKET] Phòng bị xóa qua WebSocket:', data);
        const { currentRoom } = get();

        // If current room is deleted, remove it from state
        if (currentRoom && (data.roomCode === currentRoom.roomCode || data.roomCode === currentRoom.RoomCode)) {
          console.log('[WEBSOCKET] Phòng hiện tại đã bị xóa, đang chuyển hướng...');
          set({ currentRoom: null, players: [], isHost: false });
        }

        // Refresh room list to remove deleted room
        get().loadRooms(true);
      });

      websocketService.off('ROOM_DELETED');
      websocketService.on('ROOM_DELETED', (data) => {
        const deleteData = data.Data || data;
        console.log('[WEBSOCKET] ROOM_DELETED event:', deleteData);

        const { currentRoom } = get();
        const roomCode = deleteData.RoomCode || deleteData.roomCode;

        if (currentRoom && roomCode && (roomCode === currentRoom.roomCode || roomCode === currentRoom.RoomCode)) {
          set({ currentRoom: null, players: [], isHost: false });
        }

        get().loadRooms(true);
      });

      // Keep legacy event listeners for backward compatibility
      websocketService.off('playerJoined');
      websocketService.on('playerJoined', (payload, roomCode) => {
        console.log('[ROOM] Người chơi tham gia (legacy):', payload, 'Phòng:', roomCode);
        get().refreshPlayers();
      });

      websocketService.off('playerLeft');
      websocketService.on('playerLeft', (payload, roomCode) => {
        console.log('[ROOM] Người chơi rời khỏi (legacy):', payload, 'Phòng:', roomCode);
        get().refreshPlayers();
      });

      websocketService.off('playerReady');
      websocketService.on('playerReady', (payload, roomCode) => {
        console.log('[ROOM] Trạng thái sẵn sàng của người chơi thay đổi (legacy):', payload, 'Phòng:', roomCode);
        get().refreshPlayers();
      });

    } catch (error) {
      console.error('[WEBSOCKET] Khởi tạo WebSocket thất bại:', error);
    }
  },

  // Setup WebSocket listeners
  setupWebSocketListeners: () => {
    // Unregister old listeners before registering new ones to avoid duplicates
    websocketService.off('player-joined');
    websocketService.off('room-players-updated');
    websocketService.off('sync-room-join');

    // Store processed player IDs to avoid duplicate processing
    const processedPlayerIds = new Set();

    // When a new player joins - handle both new and old formats
    websocketService.on('player-joined', (message) => {
      console.log('Store: Player joined event received', message);

      // Handle both direct object message and Type/Data/Timestamp structure
      let userData;
      let timestamp;

      // Check if message has Type/Data/Timestamp structure
      if (message.Type && message.Data) {
        userData = message.Data;
        timestamp = message.Timestamp;
        console.log('Processing new format message with Type/Data structure');
      } else {
        // Handle case where message is direct object
        userData = message;
        timestamp = new Date().toISOString();
        console.log('Processing legacy format message');
      }

      // Get userId from player data
      const userId = userData.UserId || userData.userId || userData.id || userData.Id;

      // If no userId, don't process
      if (!userId) {
        console.log('Store: Invalid player data, missing userId', userData);
        return;
      }

      // Check if this event has already been processed
      if (processedPlayerIds.has(userId)) {
        console.log('Store: Ignoring duplicate player-joined event for:', userId);
        return;
      }

      // Mark this player as processed
      processedPlayerIds.add(userId);

      // After 5 seconds, remove ID from processed list to allow processing again in future
      setTimeout(() => {
        processedPlayerIds.delete(userId);
      }, 5000);

      // Normalize player data
      const normalizedPlayer = {
        userId: userId,
        username: userData.Username || userData.username || 'Unknown',
        isHost: userData.IsHost || userData.isHost || false,
        score: userData.Score || userData.score || 0,
        isReady: userData.IsReady || userData.isReady || false,
        joinTime: timestamp || new Date().toISOString()
      };

      console.log('Normalized player data:', normalizedPlayer);

      // Add new player to list if not already there
      set((state) => {
        // Check if player already exists in list
        const existingPlayer = state.players.find(p =>
          p.userId === userId ||
          p.UserId === userId ||
          p.id === userId ||
          p.Id === userId
        );

        if (!existingPlayer) {
          console.log('Store: Adding new player to state:', normalizedPlayer.username);

          // Call API to refresh player list to ensure data sync
          setTimeout(() => {
            get().refreshPlayers();
          }, 500);

          return { players: [...state.players, normalizedPlayer] };
        }
        return state;
      });

      // Emit event to eventEmitter for components to listen
      import('../../services/eventEmitter').then(({ default: eventEmitter }) => {
        eventEmitter.emit('player-joined', normalizedPlayer);
      }).catch(err => console.error('Error importing eventEmitter:', err));
    });

    // Store processed update IDs to avoid duplicate processing
    const processedUpdateIds = new Set();

    // Handle room players updated event - new format
    websocketService.on('room-players-updated', (message) => {
      // Get data from new format
      const { Type, Data, Timestamp } = message;

      console.log(`👥 Store: room-players-updated event received`, { Type, Timestamp });
      console.log(`👥 Store: Data:`, Data);

      // Check message format
      if (!Data || !Data.Players || !Array.isArray(Data.Players)) {
        console.log('⚠️ Store: Invalid message format, missing Players array', message);
        return;
      }

      const roomCode = Data.RoomCode;
      const updatedPlayers = Data.Players;
      const totalPlayers = Data.TotalPlayers || updatedPlayers.length;
      const host = Data.Host;

      // Check if there are actual changes
      const currentPlayers = get().players;
      const currentPlayerIds = currentPlayers.map(p => p.userId || p.UserId || p.id || p.Id).filter(Boolean);
      const newPlayerIds = updatedPlayers.map(p => p.UserId).filter(Boolean);

      // Check if there are new players
      const hasNewPlayers = newPlayerIds.some(id => !currentPlayerIds.includes(id));
      // Check if there are players who left
      const hasLeavingPlayers = currentPlayerIds.some(id => !newPlayerIds.includes(id));

      // If no changes in player list, don't update
      if (!hasNewPlayers && !hasLeavingPlayers && currentPlayers.length === updatedPlayers.length) {
        console.log('ℹ️ Store: No changes in player list, skipping update');
        return;
      }

      console.log(`👥 Store: Updating players list - Current: ${currentPlayers.length}, New: ${updatedPlayers.length}`);
      console.log('👥 Store: New players:', hasNewPlayers ? 'Yes' : 'No');
      console.log('👥 Store: Players left:', hasLeavingPlayers ? 'Yes' : 'No');

      // Normalize player data according to new format
      const normalizedPlayers = updatedPlayers.map(player => ({
        userId: player.UserId,
        username: player.Username,
        isHost: player.IsHost || false,
        score: player.Score || 0,
        isReady: player.Status === 'ready',
        status: player.Status || 'waiting',
        joinTime: Timestamp || new Date().toISOString()
      }));

      // Update player list
      set({ players: normalizedPlayers });

      // Log detailed changes
      if (hasNewPlayers) {
        const newPlayers = normalizedPlayers.filter(p => {
          return p.userId && !currentPlayerIds.includes(p.userId);
        });
        console.log('👥 Store: New players joined:', newPlayers.map(p => p.username));
      }

      // Emit event to eventEmitter for components to listen
      import('../../services/eventEmitter').then(({ default: eventEmitter }) => {
        eventEmitter.emit('room-players-updated', {
          roomCode,
          players: normalizedPlayers,
          totalPlayers,
          host
        });
      }).catch(err => console.error('Error importing eventEmitter:', err));
    });

    // Listen for sync-room-join event to sync when someone joins via HTTP API
    websocketService.on('sync-room-join', (data) => {
      console.log('🔄 Store: Sync room join event received', data);

      if (data.action === 'join' && data.roomCode && data.userId && data.username) {
        // Send WebSocket joinRoom to register connection
        websocketService.joinRoom(data.roomCode, data.username, data.userId);
      }
    });
  },

  // Disconnect WebSocket
  disconnectWebSocket: () => {
    // Unregister listeners before disconnecting
    try {
      // Unregister main events
      websocketService.off('player-joined');
      websocketService.off('player-joined-data');
      websocketService.off('player-left');
      websocketService.off('room-players-updated');
      websocketService.off('room-players-updated-raw');
      websocketService.off('request-players-update');
      websocketService.off('host-changed');
      websocketService.off('room-joined');
      websocketService.off('room-created');
      websocketService.off('room-deleted');
      websocketService.off('sync-room-join');

      // Unregister legacy events
      websocketService.off('playerJoined');
      websocketService.off('playerLeft');
      websocketService.off('playerReady');

      // Unregister uppercase events
      websocketService.off('PLAYER_JOINED');
      websocketService.off('PLAYER_LEFT');
      websocketService.off('ROOM_PLAYERS_UPDATED');
      websocketService.off('HOST_CHANGED');
      websocketService.off('ROOM_JOINED');
      websocketService.off('ROOM_CREATED');
      websocketService.off('ROOM_DELETED');
      websocketService.off('PING');
      websocketService.off('PONG');

      // Unregister other events
      websocketService.off('connect');
      websocketService.off('disconnect');
      websocketService.off('error');
      websocketService.off('reconnect');
      websocketService.off('message');

      console.log('[WEBSOCKET] Đã hủy đăng ký tất cả các listener');
    } catch (error) {
      console.error('[WEBSOCKET] Lỗi khi hủy đăng ký listeners:', error);
    }

    websocketService.disconnect();
    set({ wsConnected: false });

    // Notify other components that WebSocket has disconnected
    import('../../services/eventEmitter').then(({ default: eventEmitter }) => {
      eventEmitter.emit('websocket-disconnected', { timestamp: new Date().toISOString() });
    }).catch(err => console.error('Error importing eventEmitter:', err));
  },

  // Join room via WebSocket
  joinRoomWS: (roomCode) => {
    const state = get();
    const currentUserId = state.getCurrentUserId();
    const username = state.getCurrentUsername();
    console.log('🔥 [JOIN WS] Sending:', { roomCode, username, currentUserId });

    // Send message in new format
    websocketService.send('join-room', {
      roomCode,
      username,
      userId: currentUserId
    });
  },

  // Leave room via WebSocket
  leaveRoomWS: (roomCode) => {
    const currentUserId = get().getCurrentUserId();
    const username = get().getCurrentUsername();

    // Send message in new format
    websocketService.send('leave-room', {
      roomCode,
      username,
      userId: currentUserId
    });
  },

  // Player ready status via WebSocket
  playerReadyWS: (roomCode, ready) => {
    const username = get().getCurrentUsername();

    // Send message in new format
    websocketService.send('player-ready', {
      roomCode,
      username,
      ready
    });
  },

  // Start game via WebSocket
  startGameWS: (roomCode) => {
    // Send message in new format
    websocketService.send('start-game', {
      roomCode
    });
  }
});

export default roomWebSocket;
