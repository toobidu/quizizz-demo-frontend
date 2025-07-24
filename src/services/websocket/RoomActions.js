class RoomActions {
    constructor(service) {
        this.service = service;
    }

    joinRoom(roomCode, username, userId) {
        if (!roomCode || !username || !userId) {
            
            return;
        }

        // Sử dụng định dạng mới theo tài liệu
        this.service.send('join-room', {roomCode, username, userId});
    }

    leaveRoom(roomCode, username, userId) {
        // Sử dụng định dạng mới theo tài liệu
        this.service.send('leave-room', {roomCode, username, userId});
    }

    playerReady(roomCode, ready) {
        // Sử dụng định dạng mới theo tài liệu
        this.service.send('player-ready', {roomCode, ready});
    }

    startGame(roomCode) {
        // Sử dụng định dạng mới theo tài liệu
        this.service.send('start-game', {roomCode});
    }

    // Yêu cầu cập nhật danh sách người chơi
    requestPlayersUpdate(roomCode) {
        this.service.send('request-players-update', {roomCode});
    }

    // Game actions

    // Submit answer for a question - Legacy format
    submitAnswer(roomCode, questionIndex, selectedAnswer, submitTime) {
        this.service.send('submit-answer', {
            roomCode,
            questionIndex,
            selectedAnswer,
            submitTime: submitTime || Date.now()
        });
    }

    // Submit answer with new backend API format
    submitAnswerBackend(questionId, selectedOptionId, timeToAnswer, roomCode) {
        this.service.send('submit_answer', {
            questionId,
            selectedOptionId,
            timeToAnswer,
            roomCode
        });
    }

    // Request game status
    getGameStatus(roomCode) {
        this.service.send('get-game-status', {roomCode});
    }

    // End game (host only)
    endGame(roomCode) {
        this.service.send('end-game', {roomCode});
    }
}

export default RoomActions;
