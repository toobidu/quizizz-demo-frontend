/**
 * WebSocket Logger Utility
 * 
 * Cung cấp các hàm tiện ích để ghi log WebSocket events
 */

const LOG_PREFIX = '[WEBSOCKET]';
const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
};

// Kiểm tra xem có đang ở môi trường development không
const isDev = process.env.NODE_ENV === 'development';

/**
 * Ghi log WebSocket event
 * @param {string} message - Thông điệp cần ghi log
 * @param {object} data - Dữ liệu kèm theo (optional)
 * @param {string} level - Mức độ log (info, warn, error, debug)
 */
const logEvent = (message, data = null, level = LOG_LEVELS.INFO) => {
  if (!isDev) return; // Chỉ log trong môi trường development
  
  const timestamp = new Date().toISOString();
  const logMessage = `${LOG_PREFIX} [${timestamp}] ${message}`;
  
  switch (level) {
    case LOG_LEVELS.WARN:
      console.warn(logMessage, data || '');
      break;
    case LOG_LEVELS.ERROR:
      console.error(logMessage, data || '');
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(logMessage, data || '');
      break;
    default:
      console.log(logMessage, data || '');
  }
};

/**
 * Ghi log khi kết nối WebSocket
 * @param {string} url - URL WebSocket
 */
const logConnection = (url) => {
  logEvent(`Connected to ${url}`);
};

/**
 * Ghi log khi ngắt kết nối WebSocket
 * @param {number} code - Mã ngắt kết nối
 * @param {string} reason - Lý do ngắt kết nối
 */
const logDisconnection = (code, reason) => {
  logEvent(`Disconnected. Code: ${code}, Reason: ${reason}`, null, LOG_LEVELS.WARN);
};

/**
 * Ghi log khi gửi tin nhắn WebSocket
 * @param {string} type - Loại tin nhắn
 * @param {object} data - Dữ liệu tin nhắn
 */
const logSend = (type, data) => {
  logEvent(`Sent ${type}`, data);
};

/**
 * Ghi log khi nhận tin nhắn WebSocket
 * @param {string} type - Loại tin nhắn
 * @param {object} data - Dữ liệu tin nhắn
 */
const logReceive = (type, data) => {
  logEvent(`Received ${type}`, data);
};

/**
 * Ghi log khi có lỗi WebSocket
 * @param {Error} error - Lỗi
 */
const logError = (error) => {
  logEvent(`Error: ${error.message}`, error, LOG_LEVELS.ERROR);
};

/**
 * Ghi log khi có người chơi tham gia phòng
 * @param {string} roomCode - Mã phòng
 * @param {string} username - Tên người chơi
 * @param {string} userId - ID người chơi
 */
const logPlayerJoined = (roomCode, username, userId) => {
  logEvent(`Player joined: ${username} (${userId}) in room ${roomCode}`);
};

/**
 * Ghi log khi có người chơi rời phòng
 * @param {string} roomCode - Mã phòng
 * @param {string} username - Tên người chơi
 * @param {string} userId - ID người chơi
 */
const logPlayerLeft = (roomCode, username, userId) => {
  logEvent(`Player left: ${username} (${userId}) in room ${roomCode}`);
};

export default {
  logEvent,
  logConnection,
  logDisconnection,
  logSend,
  logReceive,
  logError,
  logPlayerJoined,
  logPlayerLeft
};