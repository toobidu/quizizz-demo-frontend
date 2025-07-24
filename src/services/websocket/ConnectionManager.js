import {API_CONFIG} from '../../constants/api';

class ConnectionManager {
    constructor(service) {
        this.service = service;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
    }

    connect(delay = 0) {
        // Ngăn multiple connection attempts
        if (this.service.isConnecting || (this.service.socket && this.service.socket.readyState === WebSocket.CONNECTING)) {
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
                this.service.socket = new WebSocket(API_CONFIG.WEBSOCKET_URL);

                this.service.socket.onopen = () => {
                    this.service.isConnecting = false;
                    this.service.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Rejoin room if was in one
                    if (this.service.currentRoom) {
                        this.service.joinRoom(this.service.currentRoom);
                        this.service.requestPlayersUpdate(this.service.currentRoom);
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

                        this.service.messageHandler.handleMessage(data);
                    } catch (error) {

                    }
                };

                this.service.socket.onclose = (event) => {
                    this.service.isConnecting = false;
                    this.service.isConnected = false;

                    // Only attempt reconnect if should reconnect and not a normal closure
                    if (this.service.shouldReconnect && event.code !== 1000) {
                        this.attemptReconnect();
                    }
                };

                this.service.socket.onerror = (error) => {
                    this.service.isConnecting = false;
                    this.service.isConnected = false;
                    
                };

            } catch (error) {
                this.service.isConnecting = false;
                
                if (this.service.shouldReconnect) {
                    this.attemptReconnect();
                }
            }
        }, delay);
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            
            return;
        }

        this.reconnectAttempts++;
        // Progressive delay: 1s, 2s, 4s, 8s, 16s
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    disconnect() {
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
