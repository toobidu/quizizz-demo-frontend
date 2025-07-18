import { API_CONFIG } from '../../constants/api';

class ConnectionManager {
  constructor(service) {
    this.service = service;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  connect(delay = 0) {
    // Ngăn multiple connection attempts
    if (this.service.isConnecting ||
        (this.service.socket && this.service.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket: Connection already in progress');
      return;
    }

    // Đóng connection cũ nếu tồn tại
    if (this.service.socket && this.service.socket.readyState !== WebSocket.CLOSED) {
      this.service.socket.close();
    }

    // Add delay for initial connection to allow server startup
    setTimeout(() => {
      this.service.isConnecting = true;

      try {
        console.log('WebSocket: Attempting connection...');
        this.service.socket = new WebSocket(API_CONFIG.WEBSOCKET_URL);

        this.service.socket.onopen = () => {
          this.service.isConnecting = false;
          this.service.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('WebSocket: Connected successfully');

          // Rejoin room if was in one
          if (this.service.currentRoom) {
            this.service.joinRoom(this.service.currentRoom);
          }
        };

        this.service.socket.onmessage = (event) => {
          try {
            let data;

            // Xử lý trường hợp message là string JSON
            if (typeof event.data === 'string') {
              data = JSON.parse(event.data);
            } else {
              data = event.data;
            }

            console.log('WebSocket RAW MESSAGE:', event.data);
            console.log('WebSocket PARSED DATA:', data);
            this.service.messageHandler.handleMessage(data);
          } catch (error) {
            console.error('WebSocket message parse error:', error);
            console.error('Raw message:', event.data);
          }
        };

        this.service.socket.onclose = (event) => {
          this.service.isConnecting = false;
          this.service.isConnected = false;
          console.log('WebSocket: Disconnected. Code:', event.code, 'Reason:', event.reason);

          // Only attempt reconnect if should reconnect and not a normal closure
          if (this.service.shouldReconnect && event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.service.socket.onerror = (error) => {
          this.service.isConnecting = false;
          this.service.isConnected = false;
          console.error('WebSocket connection failed. Server may be down.');
          console.log(`WebSocket: Make sure server is running on ${API_CONFIG.WEBSOCKET_URL}`);
        };

      } catch (error) {
        this.service.isConnecting = false;
        console.error('WebSocket connection error:', error);
        if (this.service.shouldReconnect) {
          this.attemptReconnect();
        }
      }
    }, delay);
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached.');
      console.log('WebSocket: App will work in offline mode. Some features may be limited.');
      return;
    }

    this.reconnectAttempts++;
    // Progressive delay: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);
    console.log(`WebSocket: Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    console.log('WebSocket: Disconnecting...');
    this.service.shouldReconnect = false; // Ngăn reconnection khi disconnect có chủ ý
    this.service.isConnecting = false;

    if (this.service.socket) {
      this.service.socket.close(1000, 'App closing'); // Normal closure
      this.service.socket = null;
    }

    this.service.eventEmitter.clear();
    this.service.currentRoom = null;
    this.service.isConnected = false;
    this.reconnectAttempts = 0;
  }
}

export default ConnectionManager;
