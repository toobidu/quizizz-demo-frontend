import { useEffect } from 'react';
import eventEmitter from '../../services/eventEmitter';
import playerCountLogger from '../../utils/playerCountLogger';

const WebSocketHandler = ({ 
  roomCode, 
  players, 
  onPlayerJoined, 
  onPlayersUpdated 
}) => {
  // Lắng nghe sự kiện trực tiếp từ eventEmitter
  useEffect(() => {
    console.log('Thiết lập lắng nghe sự kiện từ eventEmitter cho phòng:', roomCode);

    // Xử lý sự kiện player-joined
    const handlePlayerJoined = (playerData) => {
      console.log('Nhận sự kiện player-joined từ eventEmitter:', playerData);

      // Lấy userId từ dữ liệu người chơi
      const userId = playerData.userId || playerData.UserId || playerData.id || playerData.Id;
      if (!userId) {
        console.log('Không tìm thấy userId trong dữ liệu người chơi:', playerData);
        return;
      }

      // Kiểm tra xem người chơi đã có trong danh sách chưa
      const currentPlayerIds = players.map(p => p.userId || p.UserId || p.id || p.Id).filter(Boolean);

      if (!currentPlayerIds.includes(userId)) {
        console.log('🎮 Thêm người chơi mới vào danh sách:', playerData.username || playerData.Username);

        // Chuẩn hóa dữ liệu người chơi
        const normalizedPlayer = {
          userId: userId,
          username: playerData.username || playerData.Username || 'Unknown',
          isHost: playerData.isHost || playerData.IsHost || false,
          score: playerData.score || playerData.Score || 0,
          isReady: playerData.isReady || playerData.IsReady || false,
          joinTime: playerData.joinTime || playerData.JoinTime || new Date().toISOString()
        };

        // Gọi callback để thêm người chơi mới
        onPlayerJoined(normalizedPlayer);

        // Ghi log
        playerCountLogger.logPlayerCount(roomCode, players.length + 1, 'join');
      }
    };

    // Xử lý sự kiện room-players-updated
    const handleRoomPlayersUpdated = (data) => {
      console.log('Nhận sự kiện room-players-updated từ eventEmitter:', data);

      // Kiểm tra xem dữ liệu có thuộc về phòng hiện tại không
      if (data.roomCode && data.roomCode !== roomCode) {
        console.log('👥 Bỏ qua cập nhật cho phòng khác:', data.roomCode);
        return;
      }

      // Lấy danh sách người chơi từ dữ liệu
      let newPlayers = [];
      if (data.players && Array.isArray(data.players)) {
        newPlayers = data.players;
      } else if (data.Players && Array.isArray(data.Players)) {
        newPlayers = data.Players;
      } else {
        console.log('⚠️ Không tìm thấy danh sách người chơi trong dữ liệu:', data);
        return;
      }

      // Chuẩn hóa dữ liệu người chơi
      const normalizedPlayers = newPlayers.map(player => ({
        userId: player.userId || player.UserId || player.id || player.Id,
        username: player.username || player.Username || 'Unknown',
        isHost: player.isHost || player.IsHost || false,
        score: player.score || player.Score || 0,
        isReady: player.isReady || player.IsReady || false,
        joinTime: player.joinTime || player.JoinTime || new Date().toISOString()
      }));

      // Gọi callback để cập nhật danh sách người chơi
      onPlayersUpdated(normalizedPlayers, data.host, data.totalPlayers, data.maxPlayers);
    };

    // Đăng ký lắng nghe sự kiện
    eventEmitter.on('player-joined', handlePlayerJoined);
    eventEmitter.on('room-players-updated', handleRoomPlayersUpdated);

    // Yêu cầu cập nhật danh sách người chơi ngay khi component mount
    if (roomCode) {
      console.log('Yêu cầu cập nhật danh sách người chơi khi component mount');
      import('../../services/websocketService').then(({ default: websocketService }) => {
        websocketService.send('request-players-update', { roomCode });
      });
    }

    // Cleanup khi component unmount
    return () => {
      eventEmitter.off('player-joined', handlePlayerJoined);
      eventEmitter.off('room-players-updated', handleRoomPlayersUpdated);
    };
  }, [roomCode, players, onPlayerJoined, onPlayersUpdated]);

  // This component doesn't render anything
  return null;
};

export default WebSocketHandler;