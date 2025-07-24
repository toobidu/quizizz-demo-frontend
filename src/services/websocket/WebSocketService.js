import ConnectionManager from './ConnectionManager';
import EventEmitter from './EventEmitter';
import MessageHandler from './MessageHandler';
import RoomActions from './RoomActions';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.shouldReconnect = true;

        // Khởi tạo các module con
        this.eventEmitter = new EventEmitter();
        this.connectionManager = new ConnectionManager(this);
        this.messageHandler = new MessageHandler(this);
        this.roomActions = new RoomActions(this);
    }

    connect(delay = 0) {
        this.connectionManager.connect(delay);
    }

    disconnect() {
        this.connectionManager.disconnect();
    }

    // Event listeners delegation
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }

    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }

    // Room actions delegation
    joinRoom(roomCode, username, userId) {
        this.currentRoom = roomCode;
        this.roomActions.joinRoom(roomCode, username, userId);
    }

    leaveRoom(roomCode, username, userId) {
        this.roomActions.leaveRoom(roomCode, username, userId);
        if (this.currentRoom === roomCode) {
            this.currentRoom = null;
        }
    }

    playerReady(roomCode, ready) {
        this.roomActions.playerReady(roomCode, ready);
    }

    startGame(roomCode) {
        this.roomActions.startGame(roomCode);
    }

    // Request players update
    requestPlayersUpdate(roomCode) {
        this.roomActions.requestPlayersUpdate(roomCode);
    }

    // Game methods

    // Submit answer for a question - Legacy format
    submitAnswer(roomCode, questionIndex, selectedAnswer, submitTime) {
        this.roomActions.submitAnswer(roomCode, questionIndex, selectedAnswer, submitTime);
    }

    // Submit answer with new backend API format
    submitAnswerBackend(questionId, selectedOptionId, timeToAnswer, roomCode) {
        this.roomActions.submitAnswerBackend(questionId, selectedOptionId, timeToAnswer, roomCode);
    }

    // Get game status
    getGameStatus(roomCode) {
        this.roomActions.getGameStatus(roomCode);
    }

    // End game (host only)
    endGame(roomCode) {
        this.roomActions.endGame(roomCode);
    }

    // Check if connected
    isConnected() {
        return this.isConnected;
    }

    // Send message to server
    send(type, data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            // Sử dụng định dạng mới theo tài liệu
            const message = {
                Type: type, data: data, Timestamp: new Date().toISOString()
            };
            this.socket.send(JSON.stringify(message));
        } else {
            
        }
    }

    // Helper method to show notifications
    showNotification(message) {
        this.emit('notification', {message, timestamp: new Date().toISOString()});
    }

}

export default WebSocketService;
