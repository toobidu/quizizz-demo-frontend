class EventHandlers {
  constructor(service) {
    this.service = service;
  }

  // Handle players array update (current backend format)
  handlePlayersArrayUpdate(players, roomCode = null) {
    console.log('Cập nhật mảng người chơi:', { players, roomCode });

    // Map players to consistent format
    const mappedPlayers = players.map(player => ({
      userId: player.UserId || player.userId,
      username: player.Username || player.username,
      isHost: player.IsHost || player.isHost || false,
      score: player.Score || player.score || 0,
      timeTaken: player.TimeTaken || player.timeTaken || '00:00:00',
      joinTime: player.JoinTime || player.joinTime || new Date().toISOString()
    }));

    // Tạo data object tương thích với format mới
    const data = {
      roomCode: roomCode || this.service.currentRoom,
      players: mappedPlayers,
      totalPlayers: mappedPlayers.length,
      maxPlayers: 10, // Default, có thể lấy từ room info
      status: 'waiting',
      host: mappedPlayers.find(p => p.isHost) || mappedPlayers[0] // First player as fallback
    };

    console.log('Phát sự kiện room-players-updated với dữ liệu:', data);

    // Emit event cho components
    this.service.emit('room-players-updated', data);

    // Emit room-specific event nếu có roomCode
    if (data.roomCode) {
      this.service.emit(`room-players-updated:${data.roomCode}`, data);
    }
  }

  // Handle PLAYER_JOINED event
  handlePlayerJoined(data, timestamp) {
    console.log('🎮 WebSocket PLAYER_JOINED nhận được:', data);

    // Xử lý các trường hợp khác nhau của dữ liệu
    const username = data.Username || data.username || data.name || data.Name || 'Unknown';
    const userId = data.UserId || data.userId || data.id || data.Id || 0;
    const roomCode = data.RoomCode || data.roomCode || this.service.currentRoom;

    console.log(`🎮 ${username} đã tham gia phòng ${roomCode}`);

    // Show notification
    this.service.showNotification(`${username} đã tham gia phòng`);

    // Map player data to consistent format
    const playerData = {
      userId: userId,
      username: username,
      isHost: data.IsHost || data.isHost || false,
      score: data.Score || data.score || 0,
      isReady: data.IsReady || data.isReady || false,
      joinTime: data.JoinTime || data.joinTime || new Date().toISOString()
    };

    console.log('🎮 Đã xử lý dữ liệu người chơi mới:', playerData);

    // Emit internal event for components to listen
    this.service.emit('player-joined', playerData);

    // Also emit room-specific event
    if (roomCode) {
      this.service.emit(`player-joined:${roomCode}`, playerData);
    }

    // Emit to global event emitter for components to listen
    import('../../eventEmitter').then(({ default: eventEmitter }) => {
      console.log('🎮 Phát sự kiện player-joined tới eventEmitter');
      eventEmitter.emit('player-joined', playerData);

      // Immediately trigger a room-players-updated event to force UI refresh
      eventEmitter.emit('room-players-updated', {
        roomCode,
        players: [playerData], // Include at least the new player
        action: 'join',
        timestamp: new Date().toISOString()
      });

      // Thêm: Phát sự kiện với cả tên viết hoa để đảm bảo tương thích
      eventEmitter.emit('PLAYER_JOINED', playerData);
      eventEmitter.emit('ROOM_PLAYERS_UPDATED', {
        roomCode,
        players: [playerData],
        action: 'join',
        timestamp: new Date().toISOString()
      });
    }).catch(error => {
      console.error('Lỗi khi import eventEmitter:', error);
    });

    // Request a full players update to ensure all clients have the latest player list
    if (roomCode) {
      this.service.roomActions.requestPlayersUpdate(roomCode);

      // Thêm: Gọi trực tiếp API để lấy danh sách người chơi mới nhất
      import('../../../config/api/roomsList.api.js').then(({ default: roomsApi }) => {
        roomsApi.getPlayersInRoom(roomCode).then(response => {
          if (response && response.Status === 200 && response.Data) {
            // Phát sự kiện cập nhật người chơi
            this.handleRoomPlayersUpdated({
              roomCode: roomCode,
              players: response.Data
            }, timestamp);
          }
        }).catch(error => {
          console.error('Lỗi khi lấy danh sách người chơi:', error);
        });
      }).catch(error => {
        console.error('Lỗi khi import roomsApi:', error);
      });
    }
  }

  // Handle ROOM_PLAYERS_UPDATED event
  handleRoomPlayersUpdated(data, timestamp) {
    console.log('👥 WebSocket ROOM_PLAYERS_UPDATED nhận được:', data);

    // Xử lý các trường hợp khác nhau của dữ liệu
    const players = data.Players || data.players || [];
    const roomCode = data.RoomCode || data.roomCode || this.service.currentRoom;
    const host = data.Host || data.host;
    const totalPlayers = data.TotalPlayers || data.totalPlayers || players.length;
    const maxPlayers = data.MaxPlayers || data.maxPlayers || 10;

    // Map players to consistent format
    const mappedPlayers = players.map(player => ({
      userId: player.UserId || player.userId || player.id || 0,
      username: player.Username || player.username || player.name || 'Unknown',
      score: player.Score || player.score || 0,
      isHost: player.IsHost || player.isHost || false,
      isReady: player.IsReady || player.isReady || false,
      status: player.Status || player.status || 'waiting',
      joinTime: player.JoinTime || player.joinTime || new Date().toISOString()
    }));

    const roomData = {
      roomCode: roomCode,
      players: mappedPlayers,
      totalPlayers: totalPlayers,
      maxPlayers: maxPlayers,
      host: mappedPlayers.find(p => p.isHost) || host
    };

    console.log('👥 Cập nhật danh sách người chơi:', roomData);
    console.log(`👥 Phòng ${roomCode}: ${mappedPlayers.length} người chơi`);

    // Emit event for components to listen
    this.service.emit('room-players-updated', roomData);

    // Also emit room-specific event
    if (roomCode) {
      this.service.emit(`room-players-updated:${roomCode}`, roomData);
    }

    // Emit to global event emitter for components to listen
    import('../../eventEmitter').then(({ default: eventEmitter }) => {
      console.log('👥 Phát sự kiện room-players-updated tới eventEmitter');
      eventEmitter.emit('room-players-updated', roomData);
    }).catch(error => {
      console.error('Lỗi khi import eventEmitter:', error);
    });

    // Emit raw data for debugging
    this.service.emit('room-players-updated-raw', data);
  }

  // Handle PLAYER_LEFT event
  handlePlayerLeft(data, timestamp) {
    console.log('WebSocket PLAYER_LEFT nhận được:', data);
    console.log(`${data.Username} đã rời phòng`);

    // Show notification
    this.service.showNotification(`${data.Username} đã rời phòng`);

    // Emit event for components to listen
    this.service.emit('player-left', {
      userId: data.UserId,
      username: data.Username,
      roomCode: data.RoomCode || this.service.currentRoom
    });
  }

  // Handle HOST_CHANGED event
  handleHostChanged(data, timestamp) {
    console.log('WebSocket HOST_CHANGED nhận được:', data);

    // Emit event for components to listen
    this.service.emit('host-changed', {
      newHostId: data.NewHostId,
      newHost: data.NewHost,
      message: data.Message
    });

    // Show notification if message available
    if (data.Message) {
      this.service.showNotification(data.Message);
    }
  }

  // Handle ROOM_JOINED event
  handleRoomJoined(data, timestamp) {
    console.log('WebSocket ROOM_JOINED nhận được:', data);

    // Emit event for components to listen
    this.service.emit('room-joined', data);

    // Show notification if message available
    if (data.message) {
      this.service.showNotification(data.message);
    }
  }

  // Handle PING message
  handlePing(data, timestamp) {
    console.log('WebSocket PING nhận được:', data);

    // Respond with PONG to keep connection alive
    this.sendPong(data);

    // Emit ping event with room refresh trigger
    this.service.emit('ping', { ...data, shouldRefresh: true });
  }

  // Handle PONG message
  handlePong(data, timestamp) {
    console.log('WebSocket PONG nhận được:', data);

    // Emit pong event
    this.service.emit('pong', data);
  }

  // Send PONG response
  sendPong(pingData) {
    if (this.service.socket?.readyState === WebSocket.OPEN) {
      const pongMessage = {
        Type: 'PONG',
        Data: pingData,
        Timestamp: new Date().toISOString()
      };
      this.service.socket.send(JSON.stringify(pongMessage));
      console.log('WebSocket: Sent PONG response');
    }
  }

  // Handle room created
  handleRoomCreated(data, roomCode) {
    console.log('Phòng được tạo:', { roomCode, data });

    // Emit event for lobby to update room list
    this.service.emit('room-created', data);
  }

  // Handle room deleted
  handleRoomDeleted(data, roomCode) {
    console.log('Phòng bị xóa:', { roomCode, data });

    // Emit event for components to handle room deletion
    this.service.emit('room-deleted', data);

    // If current room was deleted, clear it
    if (this.service.currentRoom === roomCode) {
      this.service.currentRoom = null;
    }
  }
}

export default EventHandlers;
