import unifiedWebSocketService from '../../services/unifiedWebSocketService';

// Biến để theo dõi trạng thái kết nối và tránh kết nối trùng lặp
let isInitializing = false;
let connectionCheckTimer = null;
let retryTimer = null;

const roomWebSocket = (set, get) => ({
    // WebSocket connection state
    wsConnected: false,

    // Initialize WebSocket connection
    initWebSocket: () => {
        try {
            if (isInitializing) {
                return;
            }

            if (unifiedWebSocketService.isConnected) {
                get().setupWebSocketListeners();
                set({wsConnected: true});
                return;
            }

            isInitializing = true;

            if (connectionCheckTimer) clearTimeout(connectionCheckTimer);
            if (retryTimer) clearTimeout(retryTimer);

            let roomCode = null;
            
            const { currentRoom } = get();
            if (currentRoom) {
                roomCode = currentRoom.roomCode || currentRoom.RoomCode || currentRoom.Code;
            }
            
            if (!roomCode) {
                roomCode = localStorage.getItem('pendingRoomJoin');
            }
            
            if (!roomCode) {
                const path = window.location.pathname;
                if (path.includes('/waiting-room/')) {
                    const matches = path.match(/\/waiting-room\/([A-Z0-9]+)/i);
                    if (matches && matches[1]) {
                        roomCode = matches[1];
                    }
                }
            }

            if (!roomCode) {
                isInitializing = false;
                return;
            }

            get().setupWebSocketEventHandlers();

            unifiedWebSocketService.connect(roomCode);

            connectionCheckTimer = setTimeout(() => {
                if (unifiedWebSocketService.isConnected) {
                    get().setupWebSocketListeners();
                    set({wsConnected: true});
                    isInitializing = false;

                    const pendingRoomJoin = localStorage.getItem('pendingRoomJoin');
                    if (pendingRoomJoin && pendingRoomJoin === roomCode) {
                        get().joinRoomWS(pendingRoomJoin);
                        localStorage.removeItem('pendingRoomJoin');
                    }
                } else {
                    isInitializing = false;
                    
                    import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                        eventEmitter.emit('websocket-connection-failed', {
                            roomCode,
                            message: 'Không thể kết nối đến máy chủ'
                        });
                    }).catch(err => {});
                }
            }, 2000);

        } catch (error) {
            isInitializing = false;
        }
    },

    setupWebSocketEventHandlers: () => {
        if (unifiedWebSocketService._handlersSetup) {
            return;
        }

        unifiedWebSocketService._handlersSetup = true;
        
        // ✅ FIXED: Xử lý khi có người chơi rời phòng và host thay đổi
        unifiedWebSocketService.on('player-left', (message) => {
            
            let Type, Data, Timestamp;
            if (message && typeof message === 'object') {
                if (message.Type && message.Data) {
                    Type = message.Type;
                    Data = message.Data;
                    Timestamp = message.Timestamp;
                } else {
                    Type = 'player-left';
                    Data = message;
                    Timestamp = new Date().toISOString();
                }
            } else {
                return;
            }

            const userId = Data.userId || Data.userId || Data.id || Data.Id;
            if (!userId) return;

            const username = Data.username || Data.username || 'Unknown';
            const newHostId = Data.newHostId || Data.newHostId;
            
            // ✅ FIXED: Xử lý thay đổi host chính xác
            if (newHostId) {
                const currentUserId = get().getCurrentUserId();
                
                if (currentUserId) {
                    const isNewHost = (
                        newHostId.toString() === currentUserId.toString() ||
                        parseInt(newHostId) === parseInt(currentUserId)
                    );
                    
                    // ✅ FIXED: Cập nhật isHost trong store
                    set({isHost: isNewHost});
                    
                    // ✅ FIXED: Cập nhật currentRoom với ownerId mới
                    const { currentRoom } = get();
                    if (currentRoom) {
                        set({
                            currentRoom: {
                                ...currentRoom,
                                ownerId: newHostId,
                                OwnerId: newHostId,
                                hostId: newHostId,
                                HostId: newHostId
                            }
                        });
                    }
                    
                    import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                        eventEmitter.emit('host-changed', {
                            newHostId, 
                            isNewHost, 
                            message: isNewHost ? 'Bạn đã trở thành chủ phòng mới!' : undefined
                        });
                    }).catch(err => {});
                }
            }
            
            // Emit event for components
            import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                eventEmitter.emit('player-left', { userId, username, newHostId });
            }).catch(err => {});
        });

        // ✅ FIXED: Xử lý sự kiện host-changed
        unifiedWebSocketService.on('host-changed', (message) => {
            
            const data = message.Data || message.data || message;
            if (!data) return;

            const currentUserId = get().getCurrentUserId();
            const newHostId = data.newHostId || data.NewHostId;
            
            if (newHostId && currentUserId) {
                const isNewHost = (
                    newHostId.toString() === currentUserId.toString() ||
                    parseInt(newHostId) === parseInt(currentUserId)
                );
                
                
                // ✅ FIXED: Cập nhật isHost
                set({isHost: isNewHost});
                
                // ✅ FIXED: Cập nhật currentRoom với ownerId mới
                const { currentRoom } = get();
                if (currentRoom) {
                    set({
                        currentRoom: {
                            ...currentRoom,
                            ownerId: newHostId,
                            OwnerId: newHostId,
                            hostId: newHostId,
                            HostId: newHostId
                        }
                    });
                }
                
                import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                    eventEmitter.emit('host-changed', {
                        newHostId, 
                        isNewHost, 
                        message: isNewHost ? 'Bạn đã trở thành chủ phòng mới!' : undefined
                    });
                }).catch(err => {});
            }
        });

        unifiedWebSocketService.on('connected', () => {
            set({wsConnected: true});
        });

        unifiedWebSocketService.on('disconnected', () => {
            set({wsConnected: false});
            unifiedWebSocketService._handlersSetup = false;
            unifiedWebSocketService._listenersSetup = false;
        });
    },

    setupWebSocketListeners: () => {
        if (unifiedWebSocketService._listenersSetup) {
            return;
        }

        if (!unifiedWebSocketService.off || !unifiedWebSocketService.on) {
            return;
        }

        unifiedWebSocketService._listenersSetup = true;

        let lastUpdateTime = 0;
        const updateThrottle = 1000;

        // ✅ FIXED: Xử lý cập nhật danh sách người chơi
        unifiedWebSocketService.on('room-players-updated', (message) => {
            const now = Date.now();
            if (now - lastUpdateTime < updateThrottle) {
                return;
            }
            lastUpdateTime = now;
            
            let messageData = null;
            let timestamp = null;

            if (message && typeof message === 'object') {
                if (message.Type && message.Data) {
                    messageData = message.Data;
                    timestamp = message.Timestamp;
                } else {
                    messageData = message;
                    timestamp = new Date().toISOString();
                }
            } else {
                return;
            }

            if (!messageData || !messageData.players) {
                return;
            }

            const { currentRoom } = get();
            if (!currentRoom) return;

            const currentUserId = get().getCurrentUserId();
            const ownerId = currentRoom.OwnerId || currentRoom.ownerId || currentRoom.hostId || currentRoom.HostId;

            // ✅ FIXED: Map players với logic host đúng
            const mappedPlayers = messageData.players.map(player => {
                const mappedPlayer = {
                    userId: player.userId || player.id || player.Id,
                    username: player.username || player.Username || 'Unknown',
                    isHost: false, // Mặc định false
                    score: player.score || player.Score || 0,
                    isReady: player.isReady !== undefined ? player.isReady : true,
                    joinTime: player.joinTime || player.JoinTime || new Date().toISOString()
                };

                // ✅ FIXED: Xác định host dựa trên ownerId
                if (ownerId && (
                    mappedPlayer.userId.toString() === ownerId.toString() ||
                    parseInt(mappedPlayer.userId) === parseInt(ownerId)
                )) {
                    mappedPlayer.isHost = true;
                }

                return mappedPlayer;
            });

            // ✅ FIXED: Cập nhật isHost cho user hiện tại
            const isCurrentUserHost = ownerId && currentUserId && (
                ownerId.toString() === currentUserId.toString() ||
                parseInt(ownerId) === parseInt(currentUserId)
            );


            // ✅ FIXED: Update store
            set({ 
                players: mappedPlayers,
                isHost: isCurrentUserHost
            });

            // Emit event for components
            import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                eventEmitter.emit('players-updated', mappedPlayers);
            }).catch(err => {});
        });

        unifiedWebSocketService.on('sync-room-join', (data) => {

            if (data.action === 'join' && data.roomCode && data.userId && data.username) {
                unifiedWebSocketService.joinRoom(data.roomCode, data.username, data.userId);
            }
        });
    },

    disconnectWebSocket: () => {
        try {
            get().resetWebSocketState();
            
            if (unifiedWebSocketService.off) {
                const events = [
                    'player-joined', 'player-left', 'room-players-updated',
                    'host-changed', 'room-joined', 'room-created', 'room-deleted',
                    'connected', 'disconnected', 'error'
                ];
                
                events.forEach(event => {
                    try {
                        unifiedWebSocketService.off(event);
                    } catch (err) {
                    }
                });
            }

            unifiedWebSocketService.disconnect();
            set({wsConnected: false});

        } catch (error) {
            set({wsConnected: false});
        }
    },

    resetWebSocketState: () => {
        unifiedWebSocketService._handlersSetup = false;
        unifiedWebSocketService._listenersSetup = false;
        isInitializing = false;
        
        if (connectionCheckTimer) {
            clearTimeout(connectionCheckTimer);
            connectionCheckTimer = null;
        }
        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    },

    _lastJoinRequest: {roomCode: null, timestamp: 0},

    joinRoomWS: (roomCode) => {
        if (!roomCode) {
            return;
        }

        const state = get();
        const currentUserId = state.getCurrentUserId();
        const username = state.getCurrentUsername();

        // Prevent duplicate join requests within 2 seconds
        const now = Date.now();
        const lastRequest = get()._lastJoinRequest;
        if (lastRequest.roomCode === roomCode && now - lastRequest.timestamp < 2000) {
            return;
        }

        // Update last join request
        get()._lastJoinRequest = {roomCode, timestamp: now};

        if (!currentUserId || !username) {
            return;
        }

        const {currentRoom} = get();
        if (currentRoom && currentRoom.roomCode === roomCode) {
            unifiedWebSocketService.send('request-players-update', {roomCode});
            return;
        }

        set({currentRoom: {roomCode}});

        const sendJoinRequest = () => {
            unifiedWebSocketService.send('join-room', {
                roomCode, username, userId: currentUserId
            });

            setTimeout(() => {
                if (get().currentRoom && get().currentRoom.roomCode === roomCode) {
                    unifiedWebSocketService.send('request-players-update', {roomCode});
                }
            }, 1000);
        };

        if (!unifiedWebSocketService.isConnected) {
            localStorage.setItem('pendingRoomJoin', roomCode);

            unifiedWebSocketService.connect();

            setTimeout(() => {
                if (unifiedWebSocketService.isConnected) {
                    sendJoinRequest();
                    localStorage.removeItem('pendingRoomJoin');
                } else {
                    setTimeout(() => {
                        if (unifiedWebSocketService.isConnected) {
                            sendJoinRequest();
                            localStorage.removeItem('pendingRoomJoin');
                        } else {
                            import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                                eventEmitter.emit('websocket-error', {
                                    message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', roomCode
                                });
                            }).catch(err => {});
                        }
                    }, 2000);
                }
            }, 1000);
        } else {
            sendJoinRequest();
        }

        get().loadRoomDetails(roomCode);
    },

    leaveRoomWS: (roomCode) => {
        const currentUserId = get().getCurrentUserId();
        const username = get().getCurrentUsername();

        unifiedWebSocketService.send('player-left', {
            roomCode, userId: currentUserId, username
        });

        unifiedWebSocketService.send('leave-room', {
            roomCode, username, userId: currentUserId
        });

        setTimeout(() => {
            unifiedWebSocketService.send('request-players-update', {roomCode});
        }, 300);
    },

    playerReadyWS: (roomCode, ready) => {
        const username = get().getCurrentUsername();

        unifiedWebSocketService.send('player-ready', {
            roomCode, username, ready
        });
    },

    startGameWS: (roomCode) => {
        unifiedWebSocketService.send('start-game', {
            roomCode
        });
    }
});

export default roomWebSocket;
