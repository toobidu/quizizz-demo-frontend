import React, {useEffect, useRef} from 'react';

const WebSocketHandler = ({
                              wsConnected,
                              actualRoomCode,
                              initWebSocket,
                              joinRoomWS,
                              leaveRoomWS,
                              setupWebSocketListeners,
                              cleanupWebSocketListeners,
                              onPlayersUpdate,
                              onHostChange,
                              onPlayerJoin,
                              onPlayerLeave
                          }) => {
    // Use refs to avoid recreating callbacks on every render
    const onPlayersUpdateRef = useRef(onPlayersUpdate);
    const onHostChangeRef = useRef(onHostChange);
    const onPlayerJoinRef = useRef(onPlayerJoin);
    const onPlayerLeaveRef = useRef(onPlayerLeave);
    const lastHostStateRef = useRef(null);

    // Update refs when props change
    useEffect(() => {
        onPlayersUpdateRef.current = onPlayersUpdate;
        onHostChangeRef.current = onHostChange;
        onPlayerJoinRef.current = onPlayerJoin;
        onPlayerLeaveRef.current = onPlayerLeave;
    });

    // Initialize WebSocket connection
    useEffect(() => {

        // Initialize WebSocket if not connected
        if (!wsConnected) {
            initWebSocket();
        }

        return () => {
            // Chỉ dọn dẹp listeners khi component unmount, không tự động rời phòng
            // Điều này tránh việc gửi sự kiện rời phòng không mong muốn
            cleanupWebSocketListeners();
        };
    }, [actualRoomCode, wsConnected]); // Removed function dependencies to prevent re-runs

    // Join room when WebSocket is connected
    useEffect(() => {
        // Only join room when WebSocket is connected
        if (wsConnected && actualRoomCode) {
            joinRoomWS(actualRoomCode);

            // Setup WebSocket listeners
            setupWebSocketListeners();
        }
    }, [wsConnected, actualRoomCode]); // Removed function dependencies to prevent re-runs

    // Set up event listeners for real-time updates
    useEffect(() => {
        if (!wsConnected) return;

        // Force refresh players list every 30 seconds (reduced frequency)
        const refreshInterval = setInterval(() => {
            import('../../services/websocketService').then(({default: websocketService}) => {
                if (websocketService.isConnected) {
                    websocketService.send('request-players-update', {roomCode: actualRoomCode});
                }
            });
        }, 30000); // Increased from 10s to 30s to reduce server load

        // Import websocketService to listen for events
        import('../../services/websocketService').then(({default: websocketService}) => {
            // Listen for ROOM_PLAYERS_UPDATED event
            const handleRoomPlayersUpdated = (data) => {
                const eventData = data.data || data; // Backend standardized format

                const playersList = eventData.players || [];
                if (Array.isArray(playersList)) {
                    // Map players from backend format to component format
                    const mappedPlayers = playersList.map(player => ({
                        userId: player.userId,
                        username: player.username,
                        isHost: player.isHost || false,
                        isReady: player.isReady || false,
                        isOnline: true, // All players in list are online
                        joinTime: player.joinTime
                    }));

                    // IMPORTANT: Replace the entire list, don't append
                    // Đây là bước quan trọng để đảm bảo danh sách người chơi luôn đồng bộ với server
                    onPlayersUpdateRef.current(mappedPlayers, eventData.host);

                    // Cập nhật trạng thái host cho người dùng hiện tại - only if changed
                    const currentUserId = localStorage.getItem('userId');
                    if (currentUserId) {
                        // Tìm host trong danh sách người chơi
                        const hostPlayer = mappedPlayers.find(p => p.isHost === true);
                        if (hostPlayer) {
                            const isCurrentUserHost = hostPlayer.userId.toString() === currentUserId;
                            // Only update if host state actually changed
                            if (lastHostStateRef.current !== isCurrentUserHost) {
                                lastHostStateRef.current = isCurrentUserHost;
                                onHostChangeRef.current(isCurrentUserHost);
                            }
                        } else {
                            // Nếu không tìm thấy host, đặt trạng thái host là false
                            if (lastHostStateRef.current !== false) {
                                lastHostStateRef.current = false;
                                onHostChangeRef.current(false);
                            }
                        }
                    } else {
                        // Nếu không có userId, đặt trạng thái host là false
                        if (lastHostStateRef.current !== false) {
                            lastHostStateRef.current = false;
                            onHostChangeRef.current(false);
                        }
                    }
                }
            };

            // Listen for ROOM_JOINED event
            const handleRoomJoined = (data) => {
                const eventData = data.data || data;

                if (eventData.isHost !== undefined) {
                    // Đảm bảo isHost là boolean và chỉ cập nhật khi cần thiết
                    const isHost = eventData.isHost === true;
                    if (lastHostStateRef.current !== isHost) {
                        lastHostStateRef.current = isHost;
                        onHostChangeRef.current(isHost);
                    }
                } else {
                    // Nếu không có thông tin host, đặt mặc định là false
                    if (lastHostStateRef.current !== false) {
                        lastHostStateRef.current = false;
                        onHostChangeRef.current(false);
                    }
                }

                // Request players update when joining room (reduced frequency)
                setTimeout(() => {
                    websocketService.send('request-players-update', {roomCode: actualRoomCode});
                }, 1000);
            };

            // Listen for HOST_CHANGED event
            const handleHostChanged = (data) => {
                const eventData = data.data || data;
                const newHost = eventData.newHost;

                // Kiểm tra xem người dùng hiện tại có phải là host mới không
                const currentUserId = localStorage.getItem('userId');
                if (currentUserId && newHost?.userId) {
                    const isCurrentUserHost = newHost.userId.toString() === currentUserId;
                    if (lastHostStateRef.current !== isCurrentUserHost) {
                        lastHostStateRef.current = isCurrentUserHost;
                        onHostChangeRef.current(isCurrentUserHost);
                    }
                } else {
                    // Nếu không có thông tin, đặt mặc định là false
                    if (lastHostStateRef.current !== false) {
                        lastHostStateRef.current = false;
                        onHostChangeRef.current(false);
                    }
                }
            };

            // Listen for PLAYER_LEFT event
            const handlePlayerLeft = (data) => {
                const eventData = data.data || data;
                const userId = eventData.userId;
                const username = eventData.username;

                if (userId) {
                    // Xử lý ngay lập tức khi nhận sự kiện player-left
                    onPlayerLeaveRef.current(userId);

                    // **IMMEDIATE FIX**: Gửi request-players-update ngay lập tức để đảm bảo UI sync
                    if (websocketService.isConnected) {
                        websocketService.send('request-players-update', {roomCode: actualRoomCode});
                    }
                }
            };

            // Listen for PLAYER_JOINED event
            const handlePlayerJoined = (data) => {
                const playerData = data.data || data;

                const userId = playerData?.userId;
                const username = playerData?.username;

                if (userId && username) {
                    // Tạo đối tượng người chơi chuẩn hóa
                    const normalizedPlayer = {
                        userId,
                        username,
                        isHost: playerData.isHost || false,
                        isReady: true, // Mặc định ready khi vào phòng
                        joinTime: playerData.joinTime || new Date().toISOString()
                    };

                    // Call the join handler
                    onPlayerJoinRef.current(normalizedPlayer);

                    // **FIX: Request players update để refresh danh sách real-time**
                    setTimeout(() => {
                        import('../../services/websocketService.js').then(({ default: websocketService }) => {
                            websocketService.send('request-players-update', { roomCode: actualRoomCode });
                        });
                    }, 500);
                }
            };

            // Register event listeners
            websocketService.on('ROOM_PLAYERS_UPDATED', handleRoomPlayersUpdated);
            websocketService.on('room-players-updated', handleRoomPlayersUpdated);
            websocketService.on('ROOM_JOINED', handleRoomJoined);
            websocketService.on('room-joined', handleRoomJoined);
            websocketService.on('HOST_CHANGED', handleHostChanged);
            websocketService.on('host-changed', handleHostChanged);
            websocketService.on('PLAYER_LEFT', handlePlayerLeft);
            websocketService.on('player-left', handlePlayerLeft);
            websocketService.on('PLAYER_JOINED', handlePlayerJoined);
            websocketService.on('player-joined', handlePlayerJoined);

            // Request initial players update with delay
            setTimeout(() => {
                if (websocketService.isConnected) {
                    websocketService.send('request-players-update', {roomCode: actualRoomCode});
                }
            }, 1000);

            // Cleanup function
            return () => {
                // Unregister event listeners
                websocketService.off('ROOM_PLAYERS_UPDATED', handleRoomPlayersUpdated);
                websocketService.off('room-players-updated', handleRoomPlayersUpdated);
                websocketService.off('ROOM_JOINED', handleRoomJoined);
                websocketService.off('room-joined', handleRoomJoined);
                websocketService.off('HOST_CHANGED', handleHostChanged);
                websocketService.off('host-changed', handleHostChanged);
                websocketService.off('PLAYER_LEFT', handlePlayerLeft);
                websocketService.off('player-left', handlePlayerLeft);
                websocketService.off('PLAYER_JOINED', handlePlayerJoined);
                websocketService.off('player-joined', handlePlayerJoined);
            };
        });

        // Cleanup interval when component unmounts
        return () => {
            clearInterval(refreshInterval);
        };
    }, [wsConnected, actualRoomCode]); // Removed function dependencies to prevent re-runs

    // This is a utility component that doesn't render anything
    return null;
};

export default WebSocketHandler;
