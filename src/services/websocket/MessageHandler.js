/**
 * WebSocket Message Handler
 *
 * Xử lý các tin nhắn nhận được từ WebSocket server
 */

import { WEBSOCKET_EVENTS } from '../../constants/game';
import EventHandlers from './handlers/EventHandlers';

class MessageHandler {
    constructor(service) {
        this.service = service;
        this.eventHandlers = new EventHandlers(service);

        // Lưu trữ các tin nhắn đã xử lý gần đây để tránh xử lý trùng lặp
        this.recentlyProcessedMessages = new Map();

        // Thời gian tối đa để lưu trữ tin nhắn đã xử lý (ms)
        this.deduplicationWindow = 3000;
    }

    // Kiểm tra xem tin nhắn đã được xử lý gần đây chưa
    isDuplicate(messageType, messageData) {
        // Đối với player-joined, chỉ kiểm tra trùng lặp nếu đã thêm thành công vào danh sách
        if (messageType.includes('player-joined') || messageType.includes('PLAYER_JOINED')) {
            // Lấy userId với các cách viết khác nhau
            const userId = messageData.userId || messageData.userId || messageData.id || messageData.Id;
            const username = messageData.username || messageData.username || messageData.name || messageData.Name;

            // Nếu không có userId hoặc username, không thể kiểm tra trùng lặp
            if (!userId || !username) {
                return false; // Cho phép xử lý để có cơ hội thêm người chơi
            }

            // Tạo ID duy nhất cho tin nhắn
            const uniqueId = `${messageType}-${userId}`;

            // Kiểm tra xem tin nhắn đã được xử lý gần đây chưa
            const lastProcessed = this.recentlyProcessedMessages.get(uniqueId);
            if (lastProcessed) {
                const now = Date.now();
                const timeSinceLastProcessed = now - lastProcessed;

                // Tăng thời gian deduplication cho player-joined lên 5 giây
                // để ngăn chặn trùng lặp khi User A reconnect nhanh
                if (timeSinceLastProcessed < 5000) {
                    return true;
                }
            }

            // Lưu thời gian xử lý tin nhắn này
            this.recentlyProcessedMessages.set(uniqueId, Date.now());
            return false;
        }
        // Xử lý room-players-updated
        else if (messageType.includes('room-players-updated') || messageType.includes('ROOM_PLAYERS_UPDATED')) {
            // Đối với room-players-updated, sử dụng roomCode và số lượng người chơi
            const roomCode = messageData.roomCode || messageData.RoomCode;
            const playerCount = (messageData.players?.length || messageData.players?.length || 0);

            if (!roomCode) return false;

            // Tạo ID duy nhất cho tin nhắn bao gồm cả timestamp để phân biệt các cập nhật gần nhau
            const timestamp = messageData.Timestamp || messageData.timestamp || new Date().toISOString();

            // Tạo ID duy nhất chỉ dựa trên roomCode và timestamp, không dùng playerCount
            // để tránh trường hợp nhận nhiều tin nhắn giống hệt nhau nhưng khác timestamp
            const uniqueId = `${messageType}-${roomCode}-${timestamp.substring(0, 19)}`;

            // Kiểm tra xem tin nhắn đã được xử lý gần đây chưa
            const lastProcessed = this.recentlyProcessedMessages.get(uniqueId);
            if (lastProcessed) {
                const now = Date.now();
                const timeSinceLastProcessed = now - lastProcessed;

                // Tăng thời gian deduplication cho room-players-updated lên 5 giây
                // để giảm tần suất cập nhật và tránh re-render liên tục
                if (timeSinceLastProcessed < 5000) {
                    return true;
                }
            }

            // Lưu thời gian xử lý tin nhắn này
            this.recentlyProcessedMessages.set(uniqueId, Date.now());

            // Thêm một ID khác không bao gồm timestamp để tránh xử lý nhiều tin nhắn
            // cùng loại trong khoảng thời gian ngắn
            const generalId = `${messageType}-${roomCode}-general`;
            this.recentlyProcessedMessages.set(generalId, Date.now());
        }

        // Xóa các tin nhắn cũ để tránh rò rỉ bộ nhớ
        this.cleanupOldMessages();

        return false;
    }

    // Xóa các tin nhắn đã xử lý quá lâu
    cleanupOldMessages() {
        const now = Date.now();
        for (const [id, timestamp] of this.recentlyProcessedMessages.entries()) {
            if (now - timestamp > this.deduplicationWindow) {
                this.recentlyProcessedMessages.delete(id);
            }
        }
    }

    handleMessage(message) {

        // Handle new official format: { "Type": "...", "Data": {...}, "Timestamp": "..." }
        const { Type, Data, Timestamp } = message;

        if (Type && Data !== undefined) {

            // Chuyển đổi Type sang chữ thường để xử lý không phân biệt hoa thường
            const typeNormalized = Type.toLowerCase();

            switch (typeNormalized) {
                case 'player_joined':
                case 'player-joined':
                case 'playerjoined':
                    // Kiểm tra trùng lặp trước khi xử lý
                    if (!this.isDuplicate('player-joined', Data)) {
                        this.eventHandlers.handlePlayerJoined(Data, Timestamp);
                    }
                    break;

                case 'player_left':
                case 'player-left':
                case 'playerleft':
                    this.eventHandlers.handlePlayerLeft(Data, Timestamp);
                    break;

                case 'room_players_updated':
                case 'room-players-updated':
                case 'roomplayersupdated':
                    // Kiểm tra trùng lặp trước khi xử lý
                    if (!this.isDuplicate('room-players-updated', Data)) {
                        this.eventHandlers.handleRoomPlayersUpdated(Data, Timestamp);
                    }
                    break;

                case 'request_players_update':
                case 'request-players-update':
                    this.service.emit('request-players-update', Data);
                    break;

                case 'host_changed':
                case 'host-changed':
                case 'hostchanged':
                    this.eventHandlers.handleHostChanged(Data, Timestamp);
                    break;

                case 'room_joined':
                case 'room-joined':
                case 'roomjoined':
                    this.eventHandlers.handleRoomJoined(Data, Timestamp);
                    break;

                case 'ping':
                    this.eventHandlers.handlePing(Data, Timestamp);
                    break;

                case 'pong':
                    this.eventHandlers.handlePong(Data, Timestamp);
                    break;

                // Game events
                case 'game_started':
                case 'game-started':
                case 'gamestarted':
                    this.eventHandlers.handleGameStarted(Data, Timestamp);
                    break;

                case 'countdown':
                    this.eventHandlers.handleCountdown(Data, Timestamp);
                    break;

                case 'question':
                    this.eventHandlers.handleQuestion(Data, Timestamp);
                    break;

                case 'answer_result':
                case 'answer-result':
                case 'answerresult':
                    this.eventHandlers.handleAnswerResult(Data, Timestamp);
                    break;

                case 'player_progress':
                case 'player-progress':
                case 'playerprogress':
                    this.eventHandlers.handlePlayerProgress(Data, Timestamp);
                    break;

                case 'game_timer_update':
                case 'game-timer-update':
                case 'gametimerupdate':
                    this.eventHandlers.handleGameTimerUpdate(Data, Timestamp);
                    break;

                // New backend API events
                case 'game_started':
                case 'gamestarted':
                    this.service.emit('GAME_STARTED', Data);
                    // Also emit legacy event for compatibility
                    this.service.emit('game-started', Data);
                    break;

                case 'question_sent':
                case 'questionsent':
                    this.service.emit('QUESTION_SENT', Data);
                    // Also emit legacy event for compatibility  
                    this.service.emit('question', Data);
                    break;

                case 'answer_result':
                case 'answerresult':
                    this.service.emit('ANSWER_RESULT', Data);
                    // Also emit legacy event for compatibility
                    this.service.emit('answer-result', Data);
                    break;

                case 'game_progress':
                case 'gameprogress':
                    this.service.emit('GAME_PROGRESS', Data);
                    break;

                case 'scoreboard_update':
                case 'scoreboardupdate':
                    this.service.emit('SCOREBOARD_UPDATE', Data);
                    break;

                case 'game_finished':
                case 'gamefinished':
                    this.service.emit('GAME_FINISHED', Data);
                    // Also emit legacy event for compatibility
                    this.service.emit('game-ended', Data);
                    break;

                // Error handling
                case 'error':
                    
                    this.service.emit('error', Data);
                    break;

                case 'game_ended':
                case 'game-ended':
                case 'gameended':
                    this.eventHandlers.handleGameEnded(Data, Timestamp);
                    break;

                // Legacy events for backward compatibility
                case WEBSOCKET_EVENTS.PING.toLowerCase():
                    this.eventHandlers.handlePing(Data, Timestamp);
                    break;

                case WEBSOCKET_EVENTS.ROOM_PLAYERS_UPDATED.toLowerCase():
                    this.eventHandlers.handleRoomPlayersUpdated(Data, Timestamp);
                    break;

                case WEBSOCKET_EVENTS.ROOM_CREATED.toLowerCase():
                    this.eventHandlers.handleRoomCreated(Data, Timestamp);
                    break;

                case WEBSOCKET_EVENTS.ROOM_DELETED.toLowerCase():
                    this.eventHandlers.handleRoomDeleted(Data, Timestamp);
                    break;

                default:
                    // Thử xử lý các trường hợp viết hoa
                    switch (Type) {
                        case 'PLAYER_JOINED':
                            // Kiểm tra trùng lặp trước khi xử lý
                            if (!this.isDuplicate('PLAYER_JOINED', Data)) {
                                this.eventHandlers.handlePlayerJoined(Data, Timestamp);
                            }
                            break;

                        case 'PLAYER_LEFT':
                            this.eventHandlers.handlePlayerLeft(Data, Timestamp);
                            break;

                        case 'ROOM_PLAYERS_UPDATED':
                            // Kiểm tra trùng lặp trước khi xử lý
                            if (!this.isDuplicate('ROOM_PLAYERS_UPDATED', Data)) {
                                this.eventHandlers.handleRoomPlayersUpdated(Data, Timestamp);
                            }
                            break;

                        case 'REQUEST_PLAYERS_UPDATE':
                            this.service.emit('REQUEST_PLAYERS_UPDATE', Data);
                            break;

                        case 'HOST_CHANGED':
                            this.eventHandlers.handleHostChanged(Data, Timestamp);
                            break;

                        case 'ROOM_JOINED':
                            this.eventHandlers.handleRoomJoined(Data, Timestamp);
                            break;

                        case 'PING':
                            this.eventHandlers.handlePing(Data, Timestamp);
                            break;

                        case 'PONG':
                            this.eventHandlers.handlePong(Data, Timestamp);
                            break;

                        // Game events
                        case 'GAME_STARTED':
                            this.eventHandlers.handleGameStarted(Data, Timestamp);
                            break;

                        case 'COUNTDOWN':
                            this.eventHandlers.handleCountdown(Data, Timestamp);
                            break;

                        case 'QUESTION':
                            this.eventHandlers.handleQuestion(Data, Timestamp);
                            break;

                        case 'ANSWER_RESULT':
                            this.eventHandlers.handleAnswerResult(Data, Timestamp);
                            break;

                        case 'PLAYER_PROGRESS':
                            this.eventHandlers.handlePlayerProgress(Data, Timestamp);
                            break;

                        case 'GAME_TIMER_UPDATE':
                            this.eventHandlers.handleGameTimerUpdate(Data, Timestamp);
                            break;

                        case 'GAME_ENDED':
                            this.eventHandlers.handleGameEnded(Data, Timestamp);
                            break;

                        default:
                            this.service.emit(Type.toLowerCase(), { Type, Data, Timestamp });
                    }
            }
            return;
        }

        // Fallback: Kiểm tra format cũ { "eventName": "...", "data": {...} }
        const { eventName, data } = message;

        if (eventName) {
            switch (eventName) {
                case 'room-players-updated':
                    if (Array.isArray(data)) {
                        this.eventHandlers.handlePlayersArrayUpdate(data);
                    } else {
                        this.eventHandlers.handleRoomPlayersUpdated(data);
                    }
                    break;

                case 'room-created':
                    this.eventHandlers.handleRoomCreated(data);
                    break;

                case 'room-deleted':
                    this.eventHandlers.handleRoomDeleted(data);
                    break;

                case 'request-players-update':
                    this.service.emit('request-players-update', data);
                    break;

                case 'ping':
                    break;

                default:
                    
            }
            return;
        }

        // Kiểm tra nếu message là array players trực tiếp
        if (Array.isArray(message)) {
            this.eventHandlers.handlePlayersArrayUpdate(message);
            return;
        }

        // Kiểm tra legacy format
        const { type, roomCode, players } = message;

        if (players && Array.isArray(players)) {
            this.eventHandlers.handlePlayersArrayUpdate(players, roomCode || message.roomCode);
            return;
        }

        if (type) {
            this.handleLegacyMessage(message);
            return;
        }
    }

    // Fallback for old message format (backward compatibility)
    handleLegacyMessage(messageData) {
        
        // FIX: Server gửi format {type, data, timestamp} thay vì {type, roomCode, payload}
        const { type, data, timestamp, roomCode, payload } = messageData;

        if (!type) {
            
            return;
        }

        // Determine the actual payload and roomCode based on message structure
        let actualPayload, actualRoomCode;
        
        if (data !== undefined) {
            // New server format: {type, data, timestamp}
            actualPayload = data;
            actualRoomCode = data?.roomCode || data?.RoomCode;
        } else if (payload !== undefined) {
            // Old format: {type, payload, roomCode}
            actualPayload = payload;
            actualRoomCode = roomCode;
        } else {
            // Fallback: use the entire message as payload
            actualPayload = messageData;
            actualRoomCode = messageData.roomCode || messageData.RoomCode;
        }

        // For room-players-updated, use EventHandlers instead of direct emit
        if (type === 'room-players-updated') {
            this.eventHandlers.handleRoomPlayersUpdated(actualPayload, timestamp);
            return;
        }

        // Emit to specific listeners (old format)
        const listeners = this.service.eventEmitter.listeners.get(type) || [];
        listeners.forEach(callback => {
            try {
                callback(actualPayload, actualRoomCode);
            } catch (error) {

            }
        });

        // Emit to room-specific listeners (old format)
        if (actualRoomCode) {
            const roomListeners = this.service.eventEmitter.listeners.get(`${type}:${actualRoomCode}`) || [];
            roomListeners.forEach(callback => {
                try {
                    callback(actualPayload, actualRoomCode);
                } catch (error) {
                    
                }
            });
        }
    }
}

export default MessageHandler;
