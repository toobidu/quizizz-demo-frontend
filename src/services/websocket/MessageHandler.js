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
      const userId = messageData.userId || messageData.UserId || messageData.id || messageData.Id;
      const username = messageData.username || messageData.Username || messageData.name || messageData.Name;
      
      // Nếu không có userId hoặc username, không thể kiểm tra trùng lặp
      if (!userId || !username) {
        console.log(`⚠️ Không thể kiểm tra trùng lặp cho player-joined vì thiếu thông tin`);
        return false; // Cho phép xử lý để có cơ hội thêm người chơi
      }
      
      // Tạo ID duy nhất cho tin nhắn
      const uniqueId = `${messageType}-${userId}`;
      
      // Kiểm tra xem tin nhắn đã được xử lý gần đây chưa
      const lastProcessed = this.recentlyProcessedMessages.get(uniqueId);
      if (lastProcessed) {
        const now = Date.now();
        const timeSinceLastProcessed = now - lastProcessed;
        
        // Giảm thời gian deduplication cho player-joined xuống 1 giây
        // để cho phép thử lại nếu lần trước thất bại
        if (timeSinceLastProcessed < 1000) {
          console.log(`🚫 Phát hiện tin nhắn player-joined trùng lặp: ${userId} (${timeSinceLastProcessed}ms sau lần xử lý trước)`);
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
      const playerCount = (messageData.players?.length || messageData.Players?.length || 0);
      
      if (!roomCode) return false;
      
      const uniqueId = `${messageType}-${roomCode}-${playerCount}`;
      
      // Kiểm tra xem tin nhắn đã được xử lý gần đây chưa
      const lastProcessed = this.recentlyProcessedMessages.get(uniqueId);
      if (lastProcessed) {
        const now = Date.now();
        const timeSinceLastProcessed = now - lastProcessed;
        
        // Nếu tin nhắn đã được xử lý trong khoảng thời gian deduplicationWindow, coi là trùng lặp
        if (timeSinceLastProcessed < this.deduplicationWindow) {
          console.log(`🚫 Phát hiện tin nhắn trùng lặp: ${messageType} (${timeSinceLastProcessed}ms sau lần xử lý trước)`);
          return true;
        }
      }
      
      // Lưu thời gian xử lý tin nhắn này
      this.recentlyProcessedMessages.set(uniqueId, Date.now());
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
    console.log('🔥 HANDLE MESSAGE START:', message);
    
    // Handle new official format: { "Type": "...", "Data": {...}, "Timestamp": "..." }
    const { Type, Data, Timestamp } = message;

    if (Type && Data !== undefined) {
      console.log(`Xử lý định dạng mới - Loại: ${Type}`, Data);
      console.log(`Thời gian tin nhắn: ${Timestamp}`);

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
          console.log('🔄 Nhận yêu cầu cập nhật danh sách người chơi (định dạng mới):', Data);
          // Gọi API để lấy danh sách người chơi mới nhất
          if (Data && Data.roomCode) {
            import('../../config/api/roomsList.api').then(({ default: roomsApi }) => {
              roomsApi.getPlayersInRoom(Data.roomCode).then(response => {
                if (response && response.Status === 200 && response.Data) {
                  // Phát sự kiện cập nhật người chơi
                  this.eventHandlers.handleRoomPlayersUpdated({
                    roomCode: Data.roomCode,
                    players: response.Data
                  }, Timestamp);
                }
              });
            });
          }
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
              console.log('🔄 Nhận yêu cầu cập nhật danh sách người chơi (viết hoa):', Data);
              // Gọi API để lấy danh sách người chơi mới nhất
              if (Data && Data.roomCode) {
                import('../../config/api/roomsList.api').then(({ default: roomsApi }) => {
                  roomsApi.getPlayersInRoom(Data.roomCode).then(response => {
                    if (response && response.Status === 200 && response.Data) {
                      // Phát sự kiện cập nhật người chơi
                      this.eventHandlers.handleRoomPlayersUpdated({
                        roomCode: Data.roomCode,
                        players: response.Data
                      }, Timestamp);
                    }
                  });
                });
              }
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
              
            default:
              console.log(`WebSocket: Loại tin nhắn không xác định: ${Type}`);
              // Emit unknown events as-is for debugging
              this.service.emit(Type.toLowerCase(), { Type, Data, Timestamp });
          }
      }
      return;
    }

    // Fallback: Kiểm tra format cũ { "eventName": "...", "data": {...} }
    const { eventName, data } = message;

    if (eventName) {
      console.log('Xử lý định dạng cũ eventName:', eventName);
      switch (eventName) {
        case 'room-players-updated':
          console.log('Sự kiện cập nhật người chơi (định dạng cũ):', data);
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
          console.log('🔄 Nhận yêu cầu cập nhật danh sách người chơi:', data);
          // Gọi API để lấy danh sách người chơi mới nhất
          if (data && data.roomCode) {
            // Gọi API để lấy danh sách người chơi mới nhất
            import('../../config/api/roomsList.api').then(({ default: roomsApi }) => {
              roomsApi.getPlayersInRoom(data.roomCode).then(response => {
                if (response && response.Status === 200 && response.Data) {
                  // Phát sự kiện cập nhật người chơi
                  this.eventHandlers.handleRoomPlayersUpdated({
                    roomCode: data.roomCode,
                    players: response.Data
                  });
                }
              });
            });
          }
          break;

        case 'ping':
          console.log('WebSocket ping nhận được (định dạng cũ)');
          break;

        default:
          console.log('WebSocket: eventName không xác định:', eventName);
      }
      return;
    }

    // Kiểm tra nếu message là array players trực tiếp
    if (Array.isArray(message)) {
      console.log('Xử lý định dạng mảng người chơi:', message);
      this.eventHandlers.handlePlayersArrayUpdate(message);
      return;
    }

    // Kiểm tra legacy format
    const { type, roomCode, players } = message;

    if (players && Array.isArray(players)) {
      console.log('Xử lý cập nhật người chơi:', players);
      this.eventHandlers.handlePlayersArrayUpdate(players, roomCode || message.roomCode);
      return;
    }

    if (type) {
      console.log('Xử lý định dạng tin nhắn cũ:', type);
      this.handleLegacyMessage(message);
      return;
    }

    // Log unknown format để debug
    console.warn('Định dạng tin nhắn không xác định:', message);
  }

  // Fallback for old message format (backward compatibility)
  handleLegacyMessage(data) {
    const { type, roomCode, payload } = data;

    if (!type) return;

    // Emit to specific listeners (old format)
    const listeners = this.service.eventEmitter.listeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback(payload, roomCode);
      } catch (error) {
        console.error(`Error in ${type} listener:`, error);
      }
    });

    // Emit to room-specific listeners (old format)
    if (roomCode) {
      const roomListeners = this.service.eventEmitter.listeners.get(`${type}:${roomCode}`) || [];
      roomListeners.forEach(callback => {
        try {
          callback(payload, roomCode);
        } catch (error) {
          console.error(`Error in ${type}:${roomCode} listener:`, error);
        }
      });
    }
  }
}

export default MessageHandler;