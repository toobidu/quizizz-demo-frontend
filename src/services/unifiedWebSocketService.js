/**
 * Unified WebSocket Service - Single source of truth
 * Replaces all existing WebSocket services to prevent conflicts
 */

class UnifiedWebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.connectionPromise = null;
        
        // Event management
        this.eventListeners = new Map();
        this.eventEmitter = this.createEventEmitter();
        
        // Connection management
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.reconnectTimer = null;
        this.heartbeatInterval = null;
        
        // Message queue for offline scenarios
        this.messageQueue = [];
        this.maxQueueSize = 100;
        
        // Room context
        this.currentRoom = null;
        this.userId = null;
        
        // Debouncing to prevent rapid reconnects
        this.connectDebounceTimeout = null;
        this.lastConnectCall = 0;
        this.connectDebounceDelay = 500;
        
        // WebSocket URL
        this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    }

    /**
     * Singleton pattern - only one instance
     */
    static getInstance() {
        if (!UnifiedWebSocketService.instance) {
            UnifiedWebSocketService.instance = new UnifiedWebSocketService();
        }
        return UnifiedWebSocketService.instance;
    }

    /**
     * Debounced connect method
     */
    async connect(roomCode = null) {
        const now = Date.now();
        
        // Debounce rapid connect calls
        if (now - this.lastConnectCall < this.connectDebounceDelay) {
            return this.connectionPromise || Promise.resolve(this.isConnected);
        }
        this.lastConnectCall = now;

        // Set current room
        if (roomCode) {
            this.currentRoom = roomCode;
        }

        // Return existing connection if available and same room
        if (this.isConnected && (!roomCode || this.currentRoom === roomCode)) {
            return Promise.resolve(true);
        }

        // Return ongoing connection attempt
        if (this.isConnecting && this.connectionPromise) {
            return this.connectionPromise;
        }

        // Start new connection
        this.connectionPromise = this._performConnect(roomCode);
        return this.connectionPromise;
    }

    /**
     * Internal connection logic
     */
    async _performConnect(roomCode) {
        this.isConnecting = true;
        
        try {
            // Disconnect if connected to different room
            if (this.isConnected && roomCode && this.currentRoom !== roomCode) {
                this._forceDisconnect();
            }
            
            // Build WebSocket URL
            let wsUrl = this.wsUrl;
            if (roomCode) {
                wsUrl = `${this.wsUrl}/waiting-room/${roomCode}`;
                this.currentRoom = roomCode;
            }

            // Create WebSocket
            this.socket = new WebSocket(wsUrl);
            this.setupEventHandlers();

            // Wait for connection
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.isConnecting = false;
                    this.connectionPromise = null;
                    reject(new Error('Connection timeout'));
                }, 10000);

                const onOpen = () => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    
                    this.startHeartbeat();
                    this.processMessageQueue();
                    this.emit('connected', { roomCode: this.currentRoom });
                    resolve(true);
                };

                const onError = (error) => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    this.connectionPromise = null;
                    reject(error);
                };

                this.socket.addEventListener('open', onOpen, { once: true });
                this.socket.addEventListener('error', onError, { once: true });
            });

        } catch (error) {
            this.isConnecting = false;
            this.connectionPromise = null;
            throw error;
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        if (!this.socket) return;

        this.socket.onmessage = (event) => {
            console.log('📥 [WS_RECEIVE] === WEBSOCKET MESSAGE RECEIVED ===');
            console.log('📥 [WS_RECEIVE] Timestamp:', new Date().toISOString());
            console.log('📥 [WS_RECEIVE] Raw event data:', event.data);
            
            try {
                const data = JSON.parse(event.data);
                console.log('📥 [WS_RECEIVE] Parsed data:', data);
                console.log('📥 [WS_RECEIVE] Current room:', this.currentRoom);
                console.log('📥 [WS_RECEIVE] Current user ID:', this.userId);
                this.handleMessage(data);
            } catch (error) {
                console.log('📥 [WS_RECEIVE] ❌ Error parsing message:', error);
                console.log('📥 [WS_RECEIVE] Raw data that failed:', event.data);
            }
        };

        this.socket.onclose = (event) => {
            const wasConnected = this.isConnected;
            this.isConnected = false;
            this.isConnecting = false;
            this.connectionPromise = null;
            this.stopHeartbeat();
            this.emit('disconnected', { 
                code: event.code, 
                reason: event.reason,
                roomCode: this.currentRoom,
                wasConnected
            });

            // Auto-reconnect unless intentional closure
            if (event.code !== 1000 && wasConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };

        this.socket.onerror = (error) => {
            this.emit('error', error);
        };
    }

    /**
     * Handle incoming messages with unified format
     */
    handleMessage(data) {
        console.log('🔄 [WS_HANDLE] === HANDLING WEBSOCKET MESSAGE ===');
        console.log('🔄 [WS_HANDLE] Timestamp:', new Date().toISOString());
        console.log('🔄 [WS_HANDLE] Raw data:', data);
        
        // Support multiple message formats from different server implementations
        let messageType, messageData;
        
        if (data.Type && data.Data !== undefined) {
            // Server format: { Type: "event-name", Data: {...} }
            messageType = data.Type;
            messageData = data.Data;
            console.log('🔄 [WS_HANDLE] Format: Server format (Type/Data)');
        } else if (data.type) {
            // Alternative format: { type: "event-name", data: {...} }
            messageType = data.type;
            messageData = data.data || data;
            console.log('🔄 [WS_HANDLE] Format: Alternative format (type/data)');
        } else if (data.event) {
            // Event format: { event: "event-name", ... }
            messageType = data.event;
            messageData = data;
            console.log('🔄 [WS_HANDLE] Format: Event format (event)');
        } else {
            // Raw data format
            messageType = 'message';
            messageData = data;
            console.log('🔄 [WS_HANDLE] Format: Raw data format');
        }

        console.log('🔄 [WS_HANDLE] Message type:', messageType);
        console.log('🔄 [WS_HANDLE] Message data:', messageData);

        if (messageType) {
            // Emit with lowercase event name for consistency
            const eventName = messageType.toLowerCase().replace(/_/g, '-');
            console.log('🔄 [WS_HANDLE] 📢 Emitting event:', eventName);
            console.log('🔄 [WS_HANDLE] Event listeners count:', this.eventListeners.get(eventName)?.size || 0);
            this.emit(eventName, messageData);
        } else {
            console.log('🔄 [WS_HANDLE] ❌ No message type found');
        }
    }

    /**
     * Send message with queue support
     */
    send(type, data = {}) {
        const message = { 
            event: type,
            data: {
                ...data,
                userId: this.userId,
                timestamp: Date.now()
            },
            roomCode: this.currentRoom
        };

        console.log('📤 [WS_SEND] === SENDING WEBSOCKET MESSAGE ===');
        console.log('📤 [WS_SEND] Event type:', type);
        console.log('📤 [WS_SEND] Data:', data);
        console.log('📤 [WS_SEND] Full message:', message);
        console.log('📤 [WS_SEND] Socket connected:', this.isConnected);
        console.log('📤 [WS_SEND] Socket ready state:', this.socket?.readyState);
        console.log('📤 [WS_SEND] Current room:', this.currentRoom);
        console.log('📤 [WS_SEND] Current user ID:', this.userId);

        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
                console.log('📤 [WS_SEND] ✅ Message sent successfully');
                return true;
            } catch (error) {
                console.log('📤 [WS_SEND] ❌ Error sending message:', error);
                this.queueMessage(message);
                return false;
            }
        } else {
            console.log('📤 [WS_SEND] ⚠️ Socket not ready, queuing message');
            this.queueMessage(message);
            return false;
        }
    }

    /**
     * Send message safely with promise support
     */
    async sendSafely(type, data = {}, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('WebSocket send timeout'));
            }, timeout);

            // Try to send immediately
            if (this.send(type, data)) {
                clearTimeout(timeoutId);
                resolve();
                return;
            }

            // If not connected, try to connect first
            if (!this.isConnected && this.currentRoom) {
                this.connect(this.currentRoom)
                    .then(() => {
                        if (this.send(type, data)) {
                            clearTimeout(timeoutId);
                            resolve();
                        } else {
                            clearTimeout(timeoutId);
                            reject(new Error('Failed to send after reconnection'));
                        }
                    })
                    .catch(error => {
                        clearTimeout(timeoutId);
                        reject(error);
                    });
            } else {
                // Queue message with promise callbacks
                this.queueMessage({ 
                    event: type, 
                    data, 
                    resolve: () => {
                        clearTimeout(timeoutId);
                        resolve();
                    }, 
                    reject: (error) => {
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                });
            }
        });
    }

    /**
     * Queue message for later sending
     */
    queueMessage(message) {
        if (this.messageQueue.length >= this.maxQueueSize) {
            const oldMessage = this.messageQueue.shift();
            if (oldMessage.reject) {
                oldMessage.reject(new Error('Message queue overflow'));
            }
        }
        
        this.messageQueue.push(message);
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        if (this.messageQueue.length === 0) {
            return;
        }

        const processedMessages = [];
        
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            
            try {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const payload = {
                        event: message.event,
                        data: message.data,
                        timestamp: message.timestamp || Date.now(),
                        roomCode: this.currentRoom
                    };
                    
                    this.socket.send(JSON.stringify(payload));
                    // Resolve promise if exists
                    if (message.resolve) {
                        message.resolve();
                    }
                    
                    processedMessages.push(message);
                } else {
                    // Put message back at front of queue
                    this.messageQueue.unshift(message);
                    break;
                }
            } catch (error) {
                if (message.reject) {
                    message.reject(error);
                }
            }
        }

        if (processedMessages.length > 0) {
        }
    }

    /**
     * Event emitter methods
     */
    createEventEmitter() {
        return {
            emit: (event, data) => {
                const listeners = this.eventListeners.get(event) || [];
                listeners.forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                    }
                });
            }
        };
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        const listeners = this.eventListeners.get(event) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }

    /**
     * Heartbeat for connection health
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send('ping', { timestamp: Date.now() });
            }
        }, 30000); // 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Reconnection logic
     */
    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(this.currentRoom).catch(error => {
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.emit('reconnect-failed', { roomCode: this.currentRoom });
                }
            });
        }, delay);
    }

    /**
     * Force disconnect without reconnection
     */
    _forceDisconnect() {
        this.stopHeartbeat();
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        if (this.socket) {
            this.socket.close(1000, 'Force disconnect');
            this.socket = null;
        }
        
        this.isConnected = false;
        this.isConnecting = false;
        this.connectionPromise = null;
    }

    /**
     * Disconnect with cleanup
     */
    disconnect() {
        this._forceDisconnect();
        
        // Clear room context on manual disconnect
        this.currentRoom = null;
        this.reconnectAttempts = 0;
        
        // Clear message queue
        this.messageQueue.forEach(message => {
            if (message.reject) {
                message.reject(new Error('Manual disconnect'));
            }
        });
        this.messageQueue = [];
        
        this.emit('disconnected', { intentional: true });
    }

    /**
     * Room management
     */
    joinRoom(roomCode) {
        // Leave previous room if different
        if (this.currentRoom && this.currentRoom !== roomCode) {
            this.send('leave-room', { 
                roomCode: this.currentRoom,
                userId: this.userId
            });
        }
        
        this.currentRoom = roomCode;
        this.userId = localStorage.getItem('userId');
        this.send('join-room', { 
            roomCode,
            userId: this.userId,
            username: localStorage.getItem('username') || 'Anonymous'
        });
        
        // Request initial players list
        setTimeout(() => {
            this.send('request-players-update', { roomCode });
        }, 1000);
    }

    leaveRoom() {
        if (this.currentRoom) {
            this.send('leave-room', { 
                roomCode: this.currentRoom,
                userId: this.userId
            });
            this.currentRoom = null;
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            currentRoom: this.currentRoom,
            queueSize: this.messageQueue.length,
            reconnectAttempts: this.reconnectAttempts,
            wsUrl: this.wsUrl,
            readyState: this.socket ? this.socket.readyState : -1
        };
    }

    /**
     * Get connection debug info
     */
    getConnectionStatus() {
        const status = this.getStatus();
        const readyStateText = this.socket ? 
            ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket.readyState] || 'UNKNOWN' : 
            'NO_SOCKET';
            
        return {
            ...status,
            readyStateText,
            lastConnectCall: this.lastConnectCall,
            hasHeartbeat: !!this.heartbeatInterval
        };
    }

    /**
     * Force reconnect
     */
    forceReconnect() {
        if (this.currentRoom) {
            this._forceDisconnect();
            return this.connect(this.currentRoom);
        } else {
            return Promise.reject(new Error('No room to reconnect to'));
        }
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this._forceDisconnect();
        
        if (this.eventListeners) {
            this.eventListeners.clear();
        }
    }
}

// Export singleton instance
export default UnifiedWebSocketService.getInstance();
