/**
 * Game Configuration Constants
 *
 * Game-related constants and configuration
 */

export const GAME_MODES = {
    ONE_VS_ONE: '1vs1', BATTLE: 'battle', TOURNAMENT: 'tournament'
};

export const ROOM_SETTINGS = {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 10,
    DEFAULT_TIME_LIMIT: 60,
    DEFAULT_QUESTION_COUNT: 10,
    MIN_QUESTIONS: 5,
    MAX_QUESTIONS: 50
};

export const PLAYER_STATUS = {
    WAITING: 'waiting', READY: 'ready', PLAYING: 'playing', FINISHED: 'finished'
};

export const ROOM_STATUS = {
    WAITING: 'waiting', STARTING: 'starting', IN_PROGRESS: 'in_progress', FINISHED: 'finished'
};

export const WEBSOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    // New format message types
    PING: 'PING',
    PONG: 'PONG',
    ROOM_PLAYERS_UPDATED: 'ROOM_PLAYERS_UPDATED',
    ROOM_CREATED: 'ROOM_CREATED',
    
    // Enhanced Game Flow Events
    GAME_START: 'game-start',
    NEXT_QUESTION: 'next-question',
    SUBMIT_ANSWER: 'submit-answer',
    ANSWER_RESULT: 'answer-result',
    SCOREBOARD_UPDATE: 'scoreboard-update',
    GAME_END: 'game-end',
    
    // Enhanced Room Management Events
    PLAYER_JOINED: 'player-joined',
    PLAYER_LEFT: 'player-left',
    ROOM_PLAYERS_UPDATE: 'room-players-update',
    
    // Backend API Events
    GAME_STARTED: 'GAME_STARTED',
    QUESTION_SENT: 'QUESTION_SENT',
    ANSWER_RESULT_API: 'ANSWER_RESULT',
    GAME_PROGRESS: 'GAME_PROGRESS',
    SCOREBOARD_UPDATE_API: 'SCOREBOARD_UPDATE',
    GAME_FINISHED: 'GAME_FINISHED',
    ROOM_DELETED: 'ROOM_DELETED',

    // Legacy events (for backward compatibility)
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_LEFT: 'playerLeft',
    PLAYER_READY: 'playerReady',
    START_GAME: 'startGame'
};
