class RoomActions {
  constructor(service) {
    this.service = service;
  }

  joinRoom(roomCode, username, userId) {
    if (!roomCode || !username || !userId) {
      console.error('WebSocket: Missing required parameters for joinRoom', { roomCode, username, userId });
      return;
    }

    console.log(`WebSocket: Sent join-room: ${roomCode} for user ${username} (${userId})`);
    // Sử dụng định dạng mới theo tài liệu
    this.service.send('join-room', { roomCode, username, userId });
  }

  leaveRoom(roomCode, username, userId) {
    // Sử dụng định dạng mới theo tài liệu
    this.service.send('leave-room', { roomCode, username, userId });
  }

  playerReady(roomCode, ready) {
    // Sử dụng định dạng mới theo tài liệu
    this.service.send('player-ready', { roomCode, ready });
  }

  startGame(roomCode) {
    // Sử dụng định dạng mới theo tài liệu
    this.service.send('start-game', { roomCode });
  }

  // Yêu cầu cập nhật danh sách người chơi
  requestPlayersUpdate(roomCode) {
    console.log(`Gửi yêu cầu cập nhật danh sách người chơi cho phòng: ${roomCode}`);
    this.service.send('request-players-update', { roomCode });
  }
}

export default RoomActions;
