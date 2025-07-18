import ConnectionManager from './ConnectionManager';
import EventEmitter from './EventEmitter';
import MessageHandler from './MessageHandler';
import RoomActions from './RoomActions';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.shouldReconnect = true;

    // Khởi tạo các module con
    this.eventEmitter = new EventEmitter();
    this.connectionManager = new ConnectionManager(this);
    this.messageHandler = new MessageHandler(this);
    this.roomActions = new RoomActions(this);
  }

  connect(delay = 0) {
    this.connectionManager.connect(delay);
  }

  disconnect() {
    this.connectionManager.disconnect();
  }

  // Event listeners delegation
  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }

  off(event, callback) {
    this.eventEmitter.off(event, callback);
  }

  emit(event, data) {
    this.eventEmitter.emit(event, data);
  }

  // Room actions delegation
  joinRoom(roomCode, username, userId) {
    this.currentRoom = roomCode;
    this.roomActions.joinRoom(roomCode, username, userId);
  }

  leaveRoom(roomCode, username, userId) {
    this.roomActions.leaveRoom(roomCode, username, userId);
    if (this.currentRoom === roomCode) {
      this.currentRoom = null;
    }
  }

  playerReady(roomCode, ready) {
    this.roomActions.playerReady(roomCode, ready);
  }

  startGame(roomCode) {
    this.roomActions.startGame(roomCode);
  }

  // Request players update
  requestPlayersUpdate(roomCode) {
    this.roomActions.requestPlayersUpdate(roomCode);
  }

  // Request players update
  requestPlayersUpdate(roomCode) {
    this.roomActions.requestPlayersUpdate(roomCode);
  }

  // Send message to server
  send(type, data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Sử dụng định dạng mới theo tài liệu
      const message = {
        Type: type,
        Data: data,
        Timestamp: new Date().toISOString()
      };
      this.socket.send(JSON.stringify(message));
      console.log(`WebSocket SENT ${type}:`, data);
    } else {
      console.warn('WebSocket: Not connected, message queued:', { type, data });
    }
  }

  // Helper method to show notifications
  showNotification(message) {
    console.log('Notification:', message);
    this.emit('notification', { message, timestamp: new Date().toISOString() });
  }


}

export default WebSocketService;
