/**
 * Các sự kiện WebSocket cho game
 */

// Các sự kiện GameFlow
export const gameFlowEvents = {
    GAME_STARTED: "game-started",       // Khi game bắt đầu
    NEW_QUESTION: "new-question",       // Khi có câu hỏi mới
    NEXT_QUESTION: "next-question",     // Khi chuyển sang câu hỏi tiếp theo
    TIMER_UPDATE: "timer-update",       // Cập nhật thời gian
    COUNTDOWN: "countdown",             // Đếm ngược trước khi bắt đầu
    PROGRESS_UPDATE: "progress-update", // Cập nhật tiến độ tất cả người chơi
    PLAYER_PROGRESS: "player-progress", // Cập nhật tiến độ người chơi hiện tại
    PLAYER_FINISHED: "player-finished", // Khi người chơi hoàn thành
    GAME_ENDED: "game-ended",           // Khi game kết thúc
    GAME_STATE_CHANGED: "game-state-changed" // Khi trạng thái game thay đổi
};

// Các sự kiện PlayerInteraction
export const playerEvents = {
    ANSWER_RESULT: "answer-result",           // Kết quả câu trả lời
    SCOREBOARD_UPDATE: "scoreboard-update",   // Cập nhật bảng điểm
    PLAYER_STATUS_CHANGED: "player-status-changed", // Trạng thái người chơi thay đổi
    QUESTION_COMPLETED: "question-completed", // Hoàn thành câu hỏi
    GAME_COMPLETED: "game-completed",         // Hoàn thành game
    ERROR: "error"                            // Lỗi
};

// Các sự kiện RoomManagement
export const roomEvents = {
    ROOM_JOINED: "room-joined",               // Tham gia phòng thành công
    ROOM_PLAYERS_UPDATED: "room-players-updated", // Danh sách người chơi cập nhật
    HOST_CHANGED: "host-changed",             // Thay đổi host
    PLAYER_LEFT: "player-left",               // Người chơi rời phòng
    ROOM_DELETED: "room-deleted"              // Phòng bị xóa
};

// Các trạng thái game
export const gameStates = {
    LOBBY: "lobby",           // Đang ở phòng chờ
    WAITING: "waiting",       // Đang chờ bắt đầu
    COUNTDOWN: "countdown",   // Đang đếm ngược
    PLAYING: "playing",       // Đang chơi
    QUESTION_ACTIVE: "question-active", // Câu hỏi đang hiển thị
    ENDED: "ended"            // Đã kết thúc
};

// Các trạng thái người chơi
export const playerStatuses = {
    WAITING: "waiting",       // Đang chờ
    READY: "ready",           // Đã sẵn sàng
    ANSWERING: "answering",   // Đang trả lời
    ANSWERED: "answered",     // Đã trả lời
    FINISHED: "finished",     // Đã hoàn thành
    ONLINE: "online",         // Đang online
    OFFLINE: "offline"        // Đã offline
};
