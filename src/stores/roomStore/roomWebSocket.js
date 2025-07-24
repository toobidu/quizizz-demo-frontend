import websocketService from '../../services/websocketService';

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
            // Ngăn chặn nhiều lần khởi tạo đồng thời
            if (isInitializing) {
                return;
            }

            isInitializing = true;

            // Xóa các timer cũ nếu có
            if (connectionCheckTimer) clearTimeout(connectionCheckTimer);
            if (retryTimer) clearTimeout(retryTimer);

            // Unregister all old listeners before new connection
            get().disconnectWebSocket();

            // Connect to WebSocket
            websocketService.connect();

            // Check connection and setup if needed
            const checkConnection = () => {
                if (!websocketService.isConnected) {
                    websocketService.connect();
                    return false;
                }
                return true;
            };

            // Check connection after 1 second
            connectionCheckTimer = setTimeout(() => {
                const isConnected = checkConnection();
                if (isConnected) {
                    // Setup listeners for WebSocket events
                    get().setupWebSocketListeners();
                    set({wsConnected: true});
                    isInitializing = false;

                    // Kiểm tra xem có phòng đang chờ tham gia không
                    const pendingRoomJoin = localStorage.getItem('pendingRoomJoin');
                    if (pendingRoomJoin) {
                        get().joinRoomWS(pendingRoomJoin);
                        localStorage.removeItem('pendingRoomJoin');
                    }

                    // Request players update if in a room
                    const {currentRoom} = get();
                    if (currentRoom) {
                        const roomCode = currentRoom.roomCode || currentRoom.RoomCode || currentRoom.Code;

                        // Chỉ yêu cầu cập nhật danh sách người chơi, không tự động tham gia lại
                        if (roomCode) {
                            websocketService.send('request-players-update', {roomCode});
                        }
                    }
                } else {
                    // Try again after 2 seconds if connection not established
                    retryTimer = setTimeout(() => {
                        const retryConnected = checkConnection();
                        if (retryConnected) {
                            get().setupWebSocketListeners();
                            set({wsConnected: true});
                            isInitializing = false;

                            // Kiểm tra xem có phòng đang chờ tham gia không
                            const pendingRoomJoin = localStorage.getItem('pendingRoomJoin');
                            if (pendingRoomJoin) {
                                get().joinRoomWS(pendingRoomJoin);
                                localStorage.removeItem('pendingRoomJoin');
                            }

                            // Request players update if in a room
                            const {currentRoom} = get();
                            if (currentRoom) {
                                const roomCode = currentRoom.roomCode || currentRoom.RoomCode || currentRoom.Code;

                                // Chỉ yêu cầu cập nhật danh sách người chơi, không tự động tham gia lại
                                if (roomCode) {
                                    websocketService.send('request-players-update', {roomCode});
                                }
                            }
                        } else {
                            isInitializing = false;
                        }
                    }, 2000);
                }
            }, 1000);

            // Listen for player-left event - only emit event and request update
            websocketService.off('player-left'); // Unregister before registering
            websocketService.on('player-left', (message) => {
                // Get data from new format
                let Type, Data, Timestamp;

                // Xử lý cả hai định dạng tin nhắn
                if (message && typeof message === 'object') {
                    if (message.Type && message.data) {
                        // Định dạng mới
                        Type = message.Type;
                        Data = message.data;
                        Timestamp = message.Timestamp;
                    } else {
                        // Định dạng cũ
                        Type = 'player-left';
                        Data = message;
                        Timestamp = new Date().toISOString();
                    }
                } else {
                    return;
                }

                // Check message format and extract user ID from various possible formats
                const userId = Data.userId || Data.userId || Data.id || Data.Id;
                if (!userId) {
                    return;
                }

                const username = Data.username || Data.username || 'Unknown';
                const newHostId = Data.newHostId || Data.newHostId;
                const roomCode = Data.RoomCode || Data.roomCode;

                // IMPORTANT: Don't modify players list directly here
                // Instead, emit event and request updated player list

                // Emit event to eventEmitter for components to listen
                import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                    eventEmitter.emit('player-left', {
                        userId, username, newHostId
                    });
                }).catch(err => {/* Ignore errors */});

                // Request updated player list from server
                if (roomCode) {
                    websocketService.send('request-players-update', {roomCode});
                    
                    // **FALLBACK**: Also refresh via API to ensure data consistency
                    setTimeout(() => {
                        get().refreshPlayers();
                    }, 1500);
                }
            });

            // Listen for host-changed event - new format
            websocketService.off('host-changed');
            websocketService.on('host-changed', (message) => {
                // Get data from new format
                const {Type, Data, Timestamp} = message;

                // Check message format
                if (!Data) {
                    return;
                }

                const {currentRoom} = get();
                const currentUserId = get().getCurrentUserId();
                const newHostId = Data.newHostId;
                const newHost = Data.NewHost;
                const notificationMessage = Data.message;
                if (currentRoom) {
                    // Đặt mặc định là false nếu không có newHostId
                    let isNewHost = false;

                    if (newHostId && currentUserId) {
                        // Chuyển đổi sang cùng kiểu dữ liệu để so sánh
                        isNewHost = parseInt(newHostId) === parseInt(currentUserId) || newHostId.toString() === currentUserId.toString();
                    }

                    // Đảm bảo isHost là boolean
                    // set({isHost: isNewHost});

                    // Emit event to eventEmitter for components to listen
                    import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                        eventEmitter.emit('host-changed', {
                            newHostId, newHost, isNewHost, message: notificationMessage
                        });
                    }).catch(err => {/* Ignore errors */});
                }
            });

            // Listen for room-joined event
            websocketService.off('room-joined');
            websocketService.on('room-joined', (message) => {
                // Get data from new format
                const {Type, Data, Timestamp} = message;

                // Check message format
                if (!Data) {
                    return;
                }

                const roomCode = Data.RoomCode;
                const isHost = Data.isHost;
                const notificationMessage = Data.message;
                // Update host status if available
                if (isHost !== undefined) {
                    set({isHost});
                }
                // Emit event to eventEmitter for components to listen
                import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                    eventEmitter.emit('room-joined', {
                        roomCode, isHost, message: notificationMessage
                    });
                }).catch(err => {/* Ignore errors */});
            });

            // Listen for room events
            websocketService.off('room-created');
            websocketService.on('room-created', (data) => {
                // Refresh room list to show new room
                get().loadRooms(true);
            });

            websocketService.off('ROOM_CREATED');
            websocketService.on('ROOM_CREATED', (data) => {
                get().loadRooms(true);
            });

            websocketService.off('room-deleted');
            websocketService.on('room-deleted', (data) => {
                const {currentRoom} = get();

                // If current room is deleted, remove it from state
                if (currentRoom && (data.roomCode === currentRoom.roomCode || data.roomCode === currentRoom.RoomCode)) {
                    set({currentRoom: null, players: [], isHost: false});
                }

                // Refresh room list to remove deleted room
                get().loadRooms(true);
            });

            websocketService.off('ROOM_DELETED');
            websocketService.on('ROOM_DELETED', (data) => {
                const deleteData = data.data || data;

                const {currentRoom} = get();
                const roomCode = deleteData.RoomCode || deleteData.roomCode;

                if (currentRoom && roomCode && (roomCode === currentRoom.roomCode || roomCode === currentRoom.RoomCode)) {
                    set({currentRoom: null, players: [], isHost: false});
                }

                get().loadRooms(true);
            });

            // Keep legacy event listeners for backward compatibility
            websocketService.off('playerJoined');
            websocketService.on('playerJoined', (payload, roomCode) => {
                get().refreshPlayers();
            });

            websocketService.off('playerLeft');
            websocketService.on('playerLeft', (payload, roomCode) => {
                get().refreshPlayers();
            });

            websocketService.off('playerReady');
            websocketService.on('playerReady', (payload, roomCode) => {
                get().refreshPlayers();
            });

        } catch (error) {
            
        }
    },

    // Setup WebSocket listeners
    setupWebSocketListeners: () => {
        // Unregister old listeners before registering new ones to avoid duplicates
        websocketService.off('player-joined');
        websocketService.off('room-players-updated');
        websocketService.off('sync-room-join');

        // When a new player joins - only emit event, don't modify players list
        websocketService.on('player-joined', (message) => {

            let userData, timestamp;
            if (message.Type && message.data) {
                userData = message.data;
                timestamp = message.Timestamp;
            } else {
                userData = message;
                timestamp = new Date().toISOString();
            }

            const userId = userData.userId || userData.userId || userData.id || userData.Id;
            const roomCode = userData.RoomCode || userData.roomCode;
            const username = userData.username || userData.username || 'Unknown';

            if (!userId) {
                return;
            }

            // Normalize player data
            const normalizedPlayer = {
                userId: userId,
                username: username,
                isHost: userData.isHost || userData.isHost || false,
                score: userData.score || userData.Score || 0,
                isReady: userData.status === 'ready' || userData.status === 'ready' || userData.isReady || false,
                status: userData.status || userData.status || 'waiting',
                joinTime: userData.joinTime || userData.joinTime || timestamp || new Date().toISOString()
            };

            // Emit event to eventEmitter for components to listen
            import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                eventEmitter.emit('player-joined', normalizedPlayer);
            }).catch(err => {/* Ignore errors */});

            // REMOVED: Don't add player to temporary list or request update immediately
            // This prevents duplicate entries when user creates and joins room
        });

        // Handle room players updated event - new format
        // Use a debounce mechanism to prevent duplicate updates
        let lastRoomPlayersUpdateTimestamp = 0;
        let lastRoomPlayersData = null;
        const debounceTime = 2000; // Increased to 2000ms debounce time to reduce re-renders

        websocketService.on('room-players-updated', (message) => {            
            // Get data from new PascalCase format { Type, Data, Timestamp }
            if (!message) {
        
        return;
    }
            const {Type, Data, Timestamp} = message;

            // Implement debounce to prevent duplicate updates
            const now = Date.now();
            if (now - lastRoomPlayersUpdateTimestamp < debounceTime) {
                return;
            }

            // Compare with previous data to avoid unnecessary updates
            const dataString = JSON.stringify(Data);
            if (lastRoomPlayersData === dataString) {
                return;
            }

            lastRoomPlayersUpdateTimestamp = now;
            lastRoomPlayersData = dataString;

            // Check message format - handle both Data and message.data 
            const messageData = Data || message.Data || message.data;

            if (!messageData) {
                
                return;
            }

            // Xử lý trường hợp messageData không có players hoặc Players không phải mảng
            let updatedPlayers = [];
            if (messageData.players && Array.isArray(messageData.players)) {
                updatedPlayers = messageData.players;
            } else if (messageData.Players && Array.isArray(messageData.Players)) {
                updatedPlayers = messageData.Players;
            } else if (Array.isArray(messageData)) {
                // Trường hợp messageData trực tiếp là mảng người chơi
                updatedPlayers = messageData;
            } else {

                // Kiểm tra xem Data có phải là một đối tượng người chơi duy nhất không
                if (Data.userId || Data.userId) {
                    // Trường hợp Data là một người chơi duy nhất
                    updatedPlayers = [Data];
                } else {
                    // Thử lấy danh sách người chơi từ API
                    get().refreshPlayers();
                    return;
                }
            }

            const roomCode = Data.roomCode || Data.RoomCode || get().currentRoom?.roomCode || get().currentRoom?.RoomCode;
            const totalPlayers = Data.totalPlayers || Data.totalPlayers || updatedPlayers.length;
            const host = Data.host || Data.host;

            // Normalize player data according to new format
            const normalizedPlayers = updatedPlayers.map(player => ({
                userId: player.userId || player.userId,
                username: player.username || player.username || 'Unknown',
                isHost: player.isHost || player.isHost || false,
                score: player.score || player.Score || 0,
                isReady: player.status === 'ready' || player.status === 'ready' || player.isReady || false,
                status: player.status || player.status || 'waiting',
                joinTime: player.joinTime || player.joinTime || Timestamp || new Date().toISOString()
            }));

            // Loại bỏ người chơi trùng lặp dựa trên userId
            const uniquePlayers = [];
            const userIds = new Set();

            normalizedPlayers.forEach(player => {
                const userId = player.userId?.toString();
                if (userId && !userIds.has(userId)) {
                    userIds.add(userId);
                    uniquePlayers.push(player);
                }
            });

            // Sort players with host first
            uniquePlayers.sort((a, b) => {
                if (a.isHost && !b.isHost) return -1;
                if (!a.isHost && b.isHost) return 1;
                return 0;
            });

            // Kiểm tra xem người dùng hiện tại có trong danh sách không
            const currentUserId = get().getCurrentUserId();

            // Tìm người chơi là host trong danh sách
            const hostPlayer = uniquePlayers.find(p => p.isHost === true);

            // Kiểm tra xem người dùng hiện tại có phải là host không - Fix type comparison
            let isCurrentUserHost = false;

            // Convert currentUserId to string for consistent comparison
            const currentUserIdStr = currentUserId?.toString();

            if (hostPlayer && currentUserIdStr) {
                // Compare both as strings to avoid type mismatch
                isCurrentUserHost = hostPlayer.userId?.toString() === currentUserIdStr;
            } else if (host && currentUserIdStr) {
                const hostUserId = (host.userId || host.userId)?.toString();
                isCurrentUserHost = hostUserId === currentUserIdStr;
            }

            const currentUserInList = uniquePlayers.some(player =>
                player.userId?.toString() === currentUserIdStr
            );

            // Nếu người dùng hiện tại không có trong danh sách và đang ở trong phòng, thêm vào
            if (!currentUserInList && currentUserId && roomCode) {
                const username = get().getCurrentUsername() || 'Unknown';

                // Tự động thêm người dùng hiện tại vào danh sách
                uniquePlayers.push({
                    userId: parseInt(currentUserId),
                    username: username,
                    isHost: isCurrentUserHost,
                    score: 0,
                    isReady: false,
                    status: 'waiting',
                    joinTime: new Date().toISOString()
                });

                // Không gửi yêu cầu tham gia phòng ở đây để tránh vòng lặp tham gia liên tục
            }

            // Kiểm tra xem danh sách có trống không
            if (uniquePlayers.length === 0) {
                // Nếu danh sách trống, thử lấy lại từ API
                get().refreshPlayers();
                return;
            }

            // IMPORTANT: This is the main source of truth for the players list
            // Always replace the entire list with the latest data from server

            // Cập nhật cả players và isHost trong một lần set để tránh render nhiều lần
            set({
                players: uniquePlayers, isHost: isCurrentUserHost === true // Đảm bảo isHost là boolean
            });

            // Emit event to eventEmitter for components to listen
            import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                eventEmitter.emit('room-players-updated', {
                    roomCode, players: uniquePlayers, totalPlayers, host, isHost: isCurrentUserHost
                });
            }).catch(err => {/* Ignore errors */});
        });

        // Listen for sync-room-join event to sync when someone joins via HTTP API
        websocketService.on('sync-room-join', (data) => {

            if (data.action === 'join' && data.roomCode && data.userId && data.username) {
                // Send WebSocket joinRoom to register connection
                websocketService.joinRoom(data.roomCode, data.username, data.userId);
            }
        });
    },

    // Disconnect WebSocket
    disconnectWebSocket: () => {
        // Unregister listeners before disconnecting
        try {
            // Unregister main events
            websocketService.off('player-joined');
            websocketService.off('player-joined-data');
            websocketService.off('player-left');
            websocketService.off('room-players-updated');
            websocketService.off('room-players-updated-raw');
            websocketService.off('request-players-update');
            websocketService.off('host-changed');
            websocketService.off('room-joined');
            websocketService.off('room-created');
            websocketService.off('room-deleted');
            websocketService.off('sync-room-join');

            // Unregister legacy events
            websocketService.off('playerJoined');
            websocketService.off('playerLeft');
            websocketService.off('playerReady');

            // Unregister uppercase events
            websocketService.off('PLAYER_JOINED');
            websocketService.off('PLAYER_LEFT');
            websocketService.off('ROOM_PLAYERS_UPDATED');
            websocketService.off('HOST_CHANGED');
            websocketService.off('ROOM_JOINED');
            websocketService.off('ROOM_CREATED');
            websocketService.off('ROOM_DELETED');
            websocketService.off('PING');
            websocketService.off('PONG');

            // Unregister other events
            websocketService.off('connect');
            websocketService.off('disconnect');
            websocketService.off('error');
            websocketService.off('reconnect');
            websocketService.off('message');

        } catch (error) {
            
        }

        websocketService.disconnect();
        set({wsConnected: false});

        // Reset biến theo dõi trạng thái kết nối
        isInitializing = false;

        // Xóa các timer nếu có
        if (connectionCheckTimer) clearTimeout(connectionCheckTimer);
        if (retryTimer) clearTimeout(retryTimer);
        connectionCheckTimer = null;
        retryTimer = null;

        // Notify other components that WebSocket has disconnected
        import('../../services/eventEmitter').then(({default: eventEmitter}) => {
            eventEmitter.emit('websocket-disconnected', {timestamp: new Date().toISOString()});
        }).catch(err => {/* Ignore errors */});
    },

    // Join room via WebSocket
    // Track last join request to prevent duplicates
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
            websocketService.send('request-players-update', {roomCode});
            return;
        }

        // Cập nhật state trước
        set({currentRoom: {roomCode}});

        // Hàm để gửi yêu cầu tham gia phòng
        const sendJoinRequest = () => {
            websocketService.send('join-room', {
                roomCode, username, userId: currentUserId
            });

            // Đợi phản hồi từ server trước khi yêu cầu cập nhật
            setTimeout(() => {
                if (get().currentRoom && get().currentRoom.roomCode === roomCode) {
                    websocketService.send('request-players-update', {roomCode});
                }
            }, 1000);
        };

        if (!websocketService.isConnected) {
            localStorage.setItem('pendingRoomJoin', roomCode);

            // Kết nối WebSocket
            websocketService.connect();

            // Kiểm tra kết nối sau 1 giây
            setTimeout(() => {
                if (websocketService.isConnected) {
                    sendJoinRequest();
                    localStorage.removeItem('pendingRoomJoin');
                } else {
                    // Thử lại sau 2 giây nếu vẫn chưa kết nối
                    setTimeout(() => {
                        if (websocketService.isConnected) {
                            sendJoinRequest();
                            localStorage.removeItem('pendingRoomJoin');
                        } else {
                            
                            // Thông báo lỗi cho người dùng
                            import('../../services/eventEmitter').then(({default: eventEmitter}) => {
                                eventEmitter.emit('websocket-error', {
                                    message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', roomCode
                                });
                            }).catch(err => {/* Ignore errors */});
                        }
                    }, 2000);
                }
            }, 1000);
        } else {
            // WebSocket đã kết nối, gửi yêu cầu tham gia ngay lập tức
            sendJoinRequest();
        }

        // Tải thông tin chi tiết về phòng
        get().loadRoomDetails(roomCode);
    },

    // Leave room via WebSocket
    leaveRoomWS: (roomCode) => {
        const currentUserId = get().getCurrentUserId();
        const username = get().getCurrentUsername();

        // Gửi sự kiện player-left trước để thông báo cho các người chơi khác
        websocketService.send('player-left', {
            roomCode, userId: currentUserId, username
        });

        // Send leave-room message
        websocketService.send('leave-room', {
            roomCode, username, userId: currentUserId
        });

        // Yêu cầu cập nhật danh sách người chơi
        setTimeout(() => {
            websocketService.send('request-players-update', {roomCode});
        }, 300);
    },

    // Player ready status via WebSocket
    playerReadyWS: (roomCode, ready) => {
        const username = get().getCurrentUsername();

        // Send message in new format
        websocketService.send('player-ready', {
            roomCode, username, ready
        });
    },

    // Start game via WebSocket
    startGameWS: (roomCode) => {
        // Send message in new format
        websocketService.send('start-game', {
            roomCode
        });
    }
});

export default roomWebSocket;
