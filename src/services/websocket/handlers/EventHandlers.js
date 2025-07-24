class EventHandlers {
    constructor(service) {
        this.service = service;
    }

    // Handle players array update (current backend format)
    handlePlayersArrayUpdate(players, roomCode = null) {

        // Map players to consistent format
        const mappedPlayers = players.map(player => ({
            userId: player.userId || player.userId,
            username: player.username || player.username,
            isHost: player.isHost || player.isHost || false,
            score: player.Score || player.score || 0,
            timeTaken: player.TimeTaken || player.timeTaken || '00:00:00',
            joinTime: player.joinTime || player.joinTime || new Date().toISOString()
        }));

        // Tạo data object tương thích với format mới
        const data = {
            roomCode: roomCode || this.service.currentRoom,
            players: mappedPlayers,
            totalPlayers: mappedPlayers.length,
            maxPlayers: 10, // Default, có thể lấy từ room info
            status: 'waiting',
            host: mappedPlayers.find(p => p.isHost) || mappedPlayers[0] // First player as fallback
        };

        // Emit event cho components
        this.service.emit('room-players-updated', data);

        // Emit room-specific event nếu có roomCode
        if (data.roomCode) {
            this.service.emit(`room-players-updated:${data.roomCode}`, data);
        }
    }

    // Handle PLAYER_JOINED event
    handlePlayerJoined(data, timestamp) {

        // Xử lý các trường hợp khác nhau của dữ liệu
        const username = data.username || data.username || data.name || data.Name || 'Unknown';
        const userId = data.userId || data.userId || data.id || data.Id || 0;
        const roomCode = data.RoomCode || data.roomCode || this.service.currentRoom;

        // Show notification
        this.service.showNotification(`${username} đã tham gia phòng`);

        // Map player data to consistent format
        const playerData = {
            userId: userId,
            username: username,
            isHost: data.isHost || data.isHost || false,
            score: data.Score || data.score || 0,
            isReady: data.isReady || data.isReady || false,
            joinTime: data.joinTime || data.joinTime || new Date().toISOString()
        };

        // Emit internal event for components to listen
        this.service.emit('player-joined', playerData);

        // Also emit room-specific event
        if (roomCode) {
            this.service.emit(`player-joined:${roomCode}`, playerData);
        }

        // Emit to global event emitter for components to listen
        import('../../eventEmitter').then(({default: eventEmitter}) => {
            eventEmitter.emit('player-joined', playerData);

            // Không phát sự kiện room-players-updated ở đây để tránh re-render liên tục
            // Chỉ phát sự kiện player-joined và để server gửi cập nhật đầy đủ

            // Thêm: Phát sự kiện với cả tên viết hoa để đảm bảo tương thích
            eventEmitter.emit('PLAYER_JOINED', playerData);
        }).catch(error => {
            
        });

        // Request a full players update to ensure all clients have the latest player list
        // Chỉ yêu cầu cập nhật một lần để tránh vòng lặp cập nhật
        if (roomCode) {
            // Sử dụng setTimeout để đảm bảo không có quá nhiều yêu cầu cập nhật liên tiếp
            setTimeout(() => {
                this.service.roomActions.requestPlayersUpdate(roomCode);
            }, 500);
        }
    }

    // Handle ROOM_PLAYERS_UPDATED event - Updated to handle PascalCase format properly
    handleRoomPlayersUpdated(data, timestamp) {
        
        // Xử lý các trường hợp khác nhau của dữ liệu - prioritize PascalCase
        const players = data.players || data.players || [];
        const roomCode = data.roomCode || data.RoomCode || this.service.currentRoom;
        const host = data.host || data.host;
        const totalPlayers = data.totalPlayers || data.totalPlayers || players.length;
        const maxPlayers = data.maxPlayers || data.maxPlayers || 10;

        // Map players to consistent format - handle both PascalCase and camelCase
        const mappedPlayers = players.map(player => ({
            userId: player.userId || player.userId || player.id || player.Id || 0,
            username: player.username || player.username || player.name || player.Name || 'Unknown',
            score: player.score || player.Score || 0,
            isHost: player.isHost || player.isHost || false,
            isReady: player.isReady || player.isReady || false,
            status: player.status || player.status || 'waiting',
            joinTime: player.joinTime || player.joinTime || timestamp || new Date().toISOString()
        }));

        // Ensure isHost is set correctly based on host object - fix type comparison
        if (host) {
            // Reset all players' host status first
            mappedPlayers.forEach(p => p.isHost = false);

            // Find host player using string comparison to avoid type mismatch
            const hostUserId = (host.userId || host.userId || host.id || host.Id)?.toString();
            const hostPlayer = mappedPlayers.find(p => p.userId?.toString() === hostUserId);

            if (hostPlayer) {
                hostPlayer.isHost = true;
            } else if (hostUserId) {
                // If host not found in players, add it
                mappedPlayers.unshift({  // Add at beginning to maintain host-first order
                    userId: parseInt(hostUserId) || hostUserId,
                    username: host.username || host.username || host.name || host.Name || 'Host',
                    isHost: true,
                    score: 0,
                    isReady: false,
                    status: 'waiting',
                    joinTime: timestamp || new Date().toISOString()
                });
            }
        }

        // Sort players with host first to ensure consistent ordering
        mappedPlayers.sort((a, b) => {
            if (a.isHost && !b.isHost) return -1;
            if (!a.isHost && b.isHost) return 1;
            return 0;
        });

        const finalData = {
            roomCode: roomCode,
            players: mappedPlayers,
            totalPlayers: totalPlayers,
            maxPlayers: maxPlayers,
            host: mappedPlayers.find(p => p.isHost) || host
        };

        // Final emit
        this.service.emit('room-players-updated', finalData);

        if (finalData.roomCode) {
            this.service.emit(`room-players-updated:${finalData.roomCode}`, finalData);
        }

        // Emit to global event emitter for components to listen
        import('../../eventEmitter').then(({default: eventEmitter}) => {
            eventEmitter.emit('room-players-updated', finalData);
        }).catch(error => {
            
        });
    }

    // Handle PLAYER_LEFT event
    handlePlayerLeft(data, timestamp) {
        // Show notification
        this.service.showNotification(`${data.username} đã rời phòng`);

        // Emit event for components to listen
        this.service.emit('player-left', {
            userId: data.userId, username: data.username, roomCode: data.RoomCode || this.service.currentRoom
        });
    }

    // Handle HOST_CHANGED event
    handleHostChanged(data, timestamp) {
        // Emit event for components to listen
        this.service.emit('host-changed', {
            newHostId: data.newHostId, newHost: data.NewHost, message: data.message
        });

        // Show notification if message available
        if (data.message) {
            this.service.showNotification(data.message);
        }
    }

    // Handle ROOM_JOINED event
    handleRoomJoined(data, timestamp) {
        // Emit event for components to listen
        this.service.emit('room-joined', data);

        // Show notification if message available
        if (data.message) {
            this.service.showNotification(data.message);
        }
    }

    // Handle PING message
    handlePing(data, timestamp) {
        // Respond with PONG to keep connection alive
        this.sendPong(data);

        // Emit ping event with room refresh trigger
        this.service.emit('ping', {...data, shouldRefresh: true});
    }

    // Handle PONG message
    handlePong(data, timestamp) {
        // Handle pong response
        this.service.emit('pong', { data, timestamp });
    }

    // Game event handlers

    // Handle GAME_STARTED event
    handleGameStarted(data, timestamp) {

        // Emit to components
        this.service.emit('game-started', {
            ...data,
            timestamp
        });
    }

    // Handle COUNTDOWN event
    handleCountdown(data, timestamp) {

        // Emit countdown value to components
        this.service.emit('countdown', {
            value: data.value || data.countdownValue || data,
            timestamp
        });
    }

    // Handle QUESTION event
    handleQuestion(data, timestamp) {

        // Map question data to consistent format
        const questionData = {
            questionId: data.questionId,
            questionIndex: data.questionIndex,
            totalQuestions: data.totalQuestions,
            questionText: data.questionText,
            options: data.options,
            timeLimit: data.timeLimit,
            questionType: data.questionType || 'multiple-choice',
            media: data.media || null,
            timestamp
        };
        
        // Emit to components
        this.service.emit('question', questionData);
        this.service.emit('new-question', questionData); // For backward compatibility
    }

    // Handle ANSWER_RESULT event
    handleAnswerResult(data, timestamp) {

        // Map answer result data
        const resultData = {
            questionIndex: data.questionIndex,
            isCorrect: data.isCorrect,
            correctAnswer: data.correctAnswer,
            pointsEarned: data.pointsEarned,
            totalScore: data.totalScore,
            timeToAnswer: data.timeToAnswer,
            timestamp
        };
        
        // Emit to components
        this.service.emit('answer-result', resultData);
    }

    // Handle PLAYER_PROGRESS event
    handlePlayerProgress(data, timestamp) {

        // Map player progress data
        const progressData = {
            players: data.players?.map(player => ({
                userId: player.userId,
                username: player.username,
                score: player.score,
                correctAnswers: player.correctAnswers,
                totalAnswers: player.totalAnswers,
                rank: player.rank
            })) || [],
            timestamp
        };
        
        // Emit to components
        this.service.emit('player-progress', progressData);
        this.service.emit('progress-update', progressData); // For backward compatibility
    }

    // Handle GAME_TIMER_UPDATE event
    handleGameTimerUpdate(data, timestamp) {

        // Emit timer update to components
        this.service.emit('game-timer-update', {
            remainingTime: data.remainingTime,
            timestamp
        });
        
        // Also emit as timer-update for backward compatibility
        this.service.emit('timer-update', {
            timeRemaining: data.remainingTime,
            timestamp
        });
    }

    // Handle GAME_ENDED event
    handleGameEnded(data, timestamp) {

        // Map game end data
        const gameEndData = {
            leaderboard: data.leaderboard?.map(player => ({
                userId: player.userId,
                username: player.username,
                score: player.score,
                correctAnswers: player.correctAnswers,
                totalAnswers: player.totalAnswers,
                rank: player.rank
            })) || [],
            gameStats: {
                totalPlayers: data.gameStats?.totalPlayers || 0,
                averageScore: data.gameStats?.averageScore || 0,
                highestScore: data.gameStats?.highestScore || 0,
                duration: data.gameStats?.duration || '00:00:00'
            },
            timestamp
        };
        
        // Emit to components
        this.service.emit('game-ended', gameEndData);
        
        // Also emit finalResults for backward compatibility
        this.service.emit('game-ended', {
            finalResults: gameEndData,
            timestamp
        });
    }

    // Send PONG response
    sendPong(pingData) {
        if (this.service.socket?.readyState === WebSocket.OPEN) {
            const pongMessage = {
                Type: 'PONG', data: pingData, Timestamp: new Date().toISOString()
            };
            this.service.socket.send(JSON.stringify(pongMessage));
        }
    }

    // Handle room created
    handleRoomCreated(data, roomCode) {
        // Emit event for lobby to update room list
        this.service.emit('room-created', data);
    }

    // Handle room deleted
    handleRoomDeleted(data, roomCode) {
        // Emit event for components to handle room deletion
        this.service.emit('room-deleted', data);

        // If current room was deleted, clear it
        if (this.service.currentRoom === roomCode) {
            this.service.currentRoom = null;
        }
    }
}

export default EventHandlers;
