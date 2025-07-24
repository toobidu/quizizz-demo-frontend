import {API_CONFIG} from '../constants/api';

class RealtimeService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.baseReconnectDelay = 1000;

        // Event listeners
        this.eventListeners = new Map();

        // Message queue for offline scenarios
        this.messageQueue = [];
        this.maxQueueSize = 100;

        // Connection health
        this.lastPingTime = null;
        this.pingInterval = null;
        this.connectionTimeout = 30000; // 30 seconds

        // Current context
        this.currentRoom = null;
        this.userId = null;
    }

    /**
     * Initialize connection with authentication
     */
    async connect(options = {}) {
        if (this.isConnecting || this.isConnected) {
            return;
        }

        this.isConnecting = true;
        this.shouldReconnect = true;

        try {
            // Get auth token
            const token = localStorage.getItem('accessToken');
            if (!token && options.requireAuth !== false) {
                throw new Error('Authentication token required');
            }

            // Build WebSocket URL with auth
            const wsUrl = new URL(API_CONFIG.WEBSOCKET_URL);
            if (token) {
                wsUrl.searchParams.set('token', token);
            }

            this.socket = new WebSocket(wsUrl.toString());
            this.setupEventHandlers();

        } catch (error) {
            this.isConnecting = false;

            if (this.shouldReconnect) {
                this.scheduleReconnect();
            }

            throw error;
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        if (!this.socket) return;

        this.socket.onopen = () => {
            this.isConnecting = false;
            this.isConnected = true;
            this.reconnectAttempts = 0;

            this.emit('connected');

            // Process queued messages
            this.processMessageQueue();

            // Start health monitoring
            this.startHealthMonitoring();

            // Rejoin room if applicable
            if (this.currentRoom) {
                this.joinRoom(this.currentRoom);
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                
            }
        };

        this.socket.onclose = (event) => {
            this.isConnecting = false;
            this.isConnected = false;
            this.stopHealthMonitoring();

            this.emit('disconnected', {code: event.code, reason: event.reason});

            // Auto-reconnect unless it's a normal closure
            if (this.shouldReconnect && event.code !== 1000) {
                this.scheduleReconnect();
            }
        };

        this.socket.onerror = (error) => {
            
            this.emit('error', error);
        };
    }

    /**
     * Handle incoming messages with modern event system
     */
    handleMessage(message) {
        // Handle different message formats
        const {Type, Data, type, data, event, eventName} = message;

        // Modern format: { Type, Data }
        if (Type && Data !== undefined) {
            this.emit(Type.toLowerCase(), Data);
            this.emit('message', {type: Type, data: Data});
            return;
        }

        // Legacy formats
        if (type) {
            this.emit(type, data || message);
            return;
        }

        if (event) {
            this.emit(event, data || message);
            return;
        }

        if (eventName) {
            this.emit(eventName, data || message);
            return;
        }

        // Fallback: emit raw message
        this.emit('raw-message', message);
    }

    /**
     * Send message with queuing support
     */
    send(type, data = {}) {
        const message = {type, data, timestamp: Date.now()};

        if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
                return true;
            } catch (error) {
                
                this.queueMessage(message);
                return false;
            }
        } else {
            this.queueMessage(message);
            return false;
        }
    }

    /**
     * Queue message for later delivery
     */
    queueMessage(message) {
        if (this.messageQueue.length >= this.maxQueueSize) {
            this.messageQueue.shift(); // Remove oldest message
        }

        this.messageQueue.push(message);
    }

    /**
     * Process queued messages when connection is restored
     */
    processMessageQueue() {
        if (this.messageQueue.length === 0) return;

        const messages = [...this.messageQueue];
        this.messageQueue = [];

        messages.forEach(message => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                try {
                    this.socket.send(JSON.stringify(message));
                } catch (error) {
                    
                    this.queueMessage(message); // Re-queue if failed
                }
            }
        });
    }

    /**
     * Schedule reconnection with exponential backoff
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit('max-reconnect-attempts');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000 // Max 30 seconds
        );

        setTimeout(() => {
            if (this.shouldReconnect) {
                this.connect();
            }
        }, delay);
    }

    /**
     * Start connection health monitoring
     */
    startHealthMonitoring() {
        this.stopHealthMonitoring();

        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.lastPingTime = Date.now();
                this.send('ping', {timestamp: this.lastPingTime});
            }
        }, 30000); // Ping every 30 seconds
    }

    /**
     * Stop health monitoring
     */
    stopHealthMonitoring() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * Event listener management
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(callback);
            if (listeners.size === 0) {
                this.eventListeners.delete(event);
            }
        }
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    
                }
            });
        }
    }

    /**
     * Room management
     */
    joinRoom(roomCode) {
        this.currentRoom = roomCode;
        return this.send('joinRoom', {roomCode});
    }

    leaveRoom(roomCode = null) {
        const room = roomCode || this.currentRoom;
        if (room) {
            this.send('leaveRoom', {roomCode: room});
            if (room === this.currentRoom) {
                this.currentRoom = null;
            }
        }
    }

    /**
     * Game actions
     */
    playerReady(roomCode, ready = true) {
        return this.send('playerReady', {roomCode, ready});
    }

    startGame(roomCode) {
        return this.send('startGame', {roomCode});
    }

    /**
     * Connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            currentRoom: this.currentRoom,
            lastPingTime: this.lastPingTime
        };
    }

    /**
     * Graceful disconnect
     */
    disconnect() {
        this.shouldReconnect = false;
        this.isConnecting = false;
        this.stopHealthMonitoring();

        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }

        this.isConnected = false;
        this.currentRoom = null;
        this.messageQueue = [];
        this.eventListeners.clear();
        this.reconnectAttempts = 0;
    }
}

// Export singleton instance
export default new RealtimeService();
