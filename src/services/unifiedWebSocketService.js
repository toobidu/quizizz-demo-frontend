/**
 * Unified WebSocket Service - Single source of truth
 * Replaces all existing WebSocket services to prevent conflicts
 */

import { ensureUsername } from '../utils/usernameUtils.js';
import { 
    createSocketConnection, 
    deleteSocketConnection, 
    updateSocketConnection 
} from '../config/api/socketConnections.api.js';

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
        this.reconnectDelay = 3000; // Tăng delay lên 3 giây để tránh reconnect quá nhanh
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
        
        // WebSocket URL - sử dụng Vite proxy trong development
        if (import.meta.env.DEV) {
            // Development: sử dụng Vite proxy
            this.wsUrl = `ws://localhost:5173/ws`;
        } else {
            // Production: kết nối trực tiếp
            this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
        }
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
            
            // ✅ FIX: Build WebSocket URL với proxy path
            let wsUrl = this.wsUrl;
            if (roomCode) {
                // Development: ws://localhost:5173/ws 
                // Production: ws://localhost:3001/waiting-room/ROOMCODE
                if (import.meta.env.DEV) {
                    wsUrl = `${this.wsUrl}/waiting-room/${roomCode}`;
                } else {
                    wsUrl = `${this.wsUrl}/waiting-room/${roomCode}`;
                }
                this.currentRoom = roomCode;
            }

            // ...existing code...

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

                const onOpen = async () => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    
                    // ✅ ENHANCED: Detailed connection success logging
                    // ...existing code...
                    
                    // ✅ FIX: Register connection in database
                    try {
                        const userId = parseInt(localStorage.getItem('userId'));
                        const username = localStorage.getItem('username');
                        
                        if (userId && this.socket) {
                            // ...existing code...
                            await createSocketConnection({
                                socketId: this.socket.url + '_' + Date.now(), // Temporary ID
                                userId: userId,
                                roomId: this.currentRoom ? parseInt(this.currentRoom) : null,
                                status: 'connected'
                            });
                            // ...existing code...
                        }
                    } catch (error) {
                        // ...existing code...
                        // Don't fail the connection for this
                    }
                    
                    this.startHeartbeat();
                    this.processMessageQueue();
                    this.emit('connected', { roomCode: this.currentRoom });
                    
                    // ✅ AUTO JOIN: Send join-room immediately after connection
                    if (this.currentRoom) {
                        // Strictly enforce userId as number and username as non-empty string
                        let rawUserId = localStorage.getItem('userId');
                        let rawUsername = localStorage.getItem('username') || localStorage.getItem('userName') || localStorage.getItem('name');
                        let userId = rawUserId ? parseInt(rawUserId) : null;
                        let username = rawUsername ? String(rawUsername).trim() : '';
                        if (!userId || isNaN(userId) || userId <= 0) {
                            // ...existing code...
                            return;
                        }
                        if (!username || username.length === 0) {
                            // ...existing code...
                            return;
                        }
                        const joinData = {
                            roomCode: this.currentRoom,
                            userId,
                            username
                        };
                        // ...existing code...
                        this.send('join-room', joinData);
                    }
                    
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
            // ...existing code...
            
            try {
                const data = JSON.parse(event.data);
                // ...existing code...
                this.handleMessage(data);
            } catch (error) {
                // ...existing code...
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
        // ...existing code...
        
        // Support multiple message formats from different server implementations
        let messageType, messageData;
        
        if (data.Type && data.Data !== undefined) {
            // Server format: { Type: "event-name", Data: {...} }
            messageType = data.Type;
            messageData = data.Data;
            // ...existing code...
        } else if (data.type) {
            // Alternative format: { type: "event-name", data: {...} }
            messageType = data.type;
            messageData = data.data || data;
            // ...existing code...
        } else if (data.event) {
            // Event format: { event: "event-name", ... }
            messageType = data.event;
            messageData = data;
            // ...existing code...
        } else {
            // Raw data format
            messageType = 'message';
            messageData = data;
            // ...existing code...
        }

        // ...existing code...

        if (messageType) {
            // Emit with lowercase event name for consistency
            const eventName = messageType.toLowerCase().replace(/_/g, '-');
            // ...existing code...
            
            this.emit(eventName, messageData);
            
            // Special handling for game events - also emit via eventEmitter for GameContainer
            if (eventName === 'game-started') {
                // Import eventEmitter dynamically to avoid circular imports
                import('./eventEmitter.js').then(({ default: eventEmitter }) => {
                    eventEmitter.emit('game-started', messageData);
                    eventEmitter.emit('game-flow-game-started', messageData);
                });
            } else if (eventName === 'question' || eventName === 'question-sent') {
                import('./eventEmitter.js').then(({ default: eventEmitter }) => {
                    eventEmitter.emit('question', messageData);
                    eventEmitter.emit('question-sent', messageData);
                    eventEmitter.emit('game-flow-question', messageData);
                });
            } else if (eventName === 'join-room-ack' || eventName === 'JOIN_ROOM_ACK') {
                
                if (messageData && messageData.success) {
                    // ...existing code...
                    this.emit('room-connection-success', {
                        roomCode: this.currentRoom,
                        message: 'Successfully joined room',
                        data: messageData
                    });
                } else {
                    // ...existing code...
                    this.emit('room-connection-failed', {
                        roomCode: this.currentRoom,
                        message: messageData?.message || 'Failed to join room',
                        data: messageData
                    });
                }
            } else if (eventName === 'room-joined' || eventName === 'join-room-success') {
                this.emit('room-connection-success', messageData);
            } else if (eventName === 'room-join-failed' || eventName === 'join-room-error') {
                this.emit('room-connection-failed', messageData);
            } else if (eventName === 'answer-result') {
                import('./eventEmitter.js').then(({ default: eventEmitter }) => {
                    eventEmitter.emit('answer-result', messageData);
                    eventEmitter.emit('game-flow-answer-result', messageData);
                });
            } else if (eventName === 'game-finished') {
                import('./eventEmitter.js').then(({ default: eventEmitter }) => {
                    eventEmitter.emit('game-finished', messageData);
                    eventEmitter.emit('game-flow-game-finished', messageData);
                });
            }
        } else {
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

        // ...existing code...

        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
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
     * Reconnection logic with auto-rejoin
     */
    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        // Thông báo UX mỗi lần reconnect (nếu có showNotification toàn cục, có thể gọi ở đây)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('ws-reconnect-attempt', { detail: { attempts: this.reconnectAttempts + 1, delay } });
            window.dispatchEvent(event);
        }
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectAttempts++;
            try {
                await this.connect();
                if (this.currentRoom) {
                    let rawUserId = localStorage.getItem('userId');
                    let rawUsername = localStorage.getItem('username') || localStorage.getItem('userName') || localStorage.getItem('name');
                    let userId = rawUserId ? parseInt(rawUserId) : null;
                    let username = rawUsername ? String(rawUsername).trim() : '';
                    if (!userId || isNaN(userId) || userId <= 0) {
                        return;
                    }
                    if (!username || username.length === 0) {
                        return;
                    }
                    const joinData = {
                        roomCode: this.currentRoom,
                        userId,
                        username
                    };
                    this.send('join-room', joinData);
                }
                this.emit('reconnect-success', { 
                    roomCode: this.currentRoom, 
                    attempts: this.reconnectAttempts 
                });
            } catch (error) {
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.emit('reconnect-failed', { 
                        roomCode: this.currentRoom, 
                        maxAttempts: this.maxReconnectAttempts 
                    });
                } else {
                    this.scheduleReconnect();
                }
            }
        }, delay);
    }

    /**
     * Force disconnect without reconnection
     */
    async _forceDisconnect() {
        this.stopHeartbeat();
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        // ✅ FIX: Cleanup socket connection in database
        if (this.socket) {
            try {
                const userId = parseInt(localStorage.getItem('userId'));
                if (userId) {
                    // Backend should handle cleanup of stale connections
                }
            } catch (error) {}
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
    joinRoom(roomCode, username = null, userId = null) {
        if (!roomCode || typeof roomCode !== 'string' || roomCode.trim().length === 0) {
            return false;
        }
        if (this.currentRoom && this.currentRoom !== roomCode) {
            this.send('leave-room', {
                roomCode: this.currentRoom,
                userId: this.userId
            });
        }
        this.currentRoom = roomCode;
        let rawUserId = userId != null ? userId : localStorage.getItem('userId');
        let finalUserId = rawUserId ? parseInt(rawUserId) : null;
        if (!finalUserId || isNaN(finalUserId) || finalUserId <= 0) {
            return false;
        }
        this.userId = finalUserId;
        let rawUsername = username != null ? username : (localStorage.getItem('username') || localStorage.getItem('userName') || localStorage.getItem('name'));
        let finalUsername = rawUsername ? String(rawUsername).trim() : '';
        if (!finalUsername || finalUsername.length === 0) {
            return false;
        }
        const joinData = {
            roomCode: roomCode,
            userId: this.userId,
            username: finalUsername
        };
        this.send('join-room', joinData);
        setTimeout(() => {
            this.send('request-players-update', { roomCode });
        }, 1000);
        return true;
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
