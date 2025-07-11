import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) return;
    
    try {
      this.socket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 3,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Socket connected');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
        // Tạm thời tắt socket nếu không thể kết nối sau 3 lần thử
        if (this.socket) {
          this.socket.disconnect();
        }
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Socket disconnected');
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();