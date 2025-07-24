import React, { useState, useEffect } from 'react';
import { showNotification } from '../../utils/notificationUtils';
import '../../style/components/Notification.css';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../layouts/Header.jsx';
import Footer from '../../layouts/Footer.jsx';
import topicsApi from '../../config/api/topics.api.js';
import roomsApi from '../../config/api/roomsList.api.js';
import useRoomStore from '../../stores/useRoomStore.js';
import { create } from 'zustand';
import '../../style/pages/room/WaitingRoom.css';
import '../../style/components/PlayerEffects.css';
import RoomHeader from '../../components/waitingRoom/RoomHeader.jsx';
import RoomCodeCard from '../../components/waitingRoom/RoomCodeCard.jsx';
import RoomInfoGrid from '../../components/waitingRoom/RoomInfoGrid.jsx';
import PlayersList from '../../components/waitingRoom/PlayersList.jsx';
import ActionButtons from '../../components/waitingRoom/ActionButtons.jsx';
import WebSocketHandler from '../../components/waitingRoom/WebSocketHandler.jsx';
import LoadingState from '../../components/waitingRoom/LoadingState.jsx';
import ErrorState from '../../components/waitingRoom/ErrorState.jsx';
import NotificationContainer from '../../components/common/NotificationContainer.jsx';

const WaitingRoom = ({ roomId }) => {
  const { roomCode } = useParams();
  const actualRoomCode = roomId || roomCode;
  const navigate = useNavigate();

  // State management
  const [newPlayerIds, setNewPlayerIds] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  // Xóa isReady state vì không cần nữa

  // Get state from store
  const {
    players,
    isHost,
    setIsHost,
    removePlayer,
    initWebSocket,
    joinRoomWS,
    leaveRoomWS,
    // Xóa playerReadyWS vì không cần nữa
    wsConnected,
    setupWebSocketListeners,
    cleanupWebSocketListeners,
    loadRoomDetails
  } = useRoomStore();

  // Xử lý khi có người chơi mới tham gia
  const handlePlayerJoin = React.useCallback((newPlayer) => {
    // Hiển thị thông báo
    showNotification(`${newPlayer.username} đã tham gia phòng!`, 'success');

    // Thêm vào danh sách người chơi mới để hiển thị hiệu ứng
    setNewPlayerIds(ids => {
      if (!ids.includes(newPlayer.userId)) {
        return [...ids, newPlayer.userId];
      }
      return ids;
    });

    // Xóa khỏi danh sách người chơi mới sau 3 giây
    setTimeout(() => {
      setNewPlayerIds(ids => ids.filter(id => id !== newPlayer.userId));
    }, 3000);
  }, []);

  // Xử lý khi có người chơi rời phòng
  const handlePlayerLeave = React.useCallback((userId, newHostId) => {
    // Lưu thông tin người chơi trước khi xóa để hiển thị thông báo
    const leavingPlayer = players.find(p =>
      p.userId === userId ||
      p.userId?.toString() === userId?.toString()
    );

    if (leavingPlayer) {
      showNotification(`${leavingPlayer.username} đã rời phòng!`, 'warning');

      // **IMMEDIATE UPDATE: Remove player from list for real-time UI**
      removePlayer(userId);

      // Nếu người rời phòng là host, cần kiểm tra host mới
      if (leavingPlayer.isHost) {
        
      }
    } else {
      
    }

    // Kiểm tra xem người dùng hiện tại có phải là host mới không
    if (newHostId) {
      const currentUserId = localStorage.getItem('userId');
      const isNewHost = currentUserId &&
          (newHostId === parseInt(currentUserId) ||
           newHostId?.toString() === currentUserId);

      if (isNewHost) {
        showNotification('Bạn đã trở thành chủ phòng mới!', 'success');

        // Kiểm tra xem setIsHost có phải là hàm không
        if (typeof setIsHost === 'function') {
          setIsHost(true);
        } else {
          
        }
      } else {
        // Nếu không phải host mới, đảm bảo trạng thái isHost là false
        if (typeof setIsHost === 'function') {
          setIsHost(false);
        } else {
          
        }

        // Tìm người chơi là host mới
        const newHostPlayer = players.find(p =>
          (p.userId === newHostId || p.userId === newHostId ||
           p.userId?.toString() === newHostId?.toString())
        );

        if (newHostPlayer) {
          showNotification(`${newHostPlayer.username} đã trở thành chủ phòng mới!`, 'info');
        }
      }
    }

    // Yêu cầu cập nhật danh sách người chơi sau khi xử lý sự kiện rời phòng
    setTimeout(() => {
      import('../../services/websocketService.js').then(({ default: websocketService }) => {
        websocketService.send('request-players-update', { roomCode: actualRoomCode });
      });
    }, 500);

  }, [players, setIsHost, actualRoomCode, removePlayer]);
  // WebSocket functions are already imported from store above

  // Xử lý khi đóng trình duyệt hoặc tải lại trang
  useEffect(() => {
    if (!actualRoomCode) return;

    const handleBeforeUnload = (e) => {
      // Đặt cờ để biết rằng người dùng đã đóng trình duyệt
      localStorage.setItem('closedBrowser', 'true');

      // Không cần gọi API ở đây vì có thể gây ra vấn đề hiệu suất
      // Thay vào đó, server sẽ phát hiện người dùng mất kết nối qua cơ chế heartbeat
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [actualRoomCode]);

  // Load room data
  const loadData = async () => {
    setLoading(true);

    try {

      // Load topics
      const topicsResponse = await topicsApi.getAllTopics();
      if (topicsResponse && (topicsResponse.status === 200 || topicsResponse.status === 200)) {
        const topicsData = topicsResponse.data || [];

        // Chuẩn hóa dữ liệu chủ đề để đảm bảo định dạng nhất quán
        const normalizedTopics = topicsData.map(topic => ({
          id: topic.Id || topic.id,
          name: topic.Name || topic.name
        }));

        setTopics(normalizedTopics);
        
      }

      // Load room data
      const roomResponse = await roomsApi.getRoomByCode(actualRoomCode);

      if (roomResponse && (roomResponse.status === 200 || roomResponse.status === 200)) {
        const roomData = roomResponse.data || roomResponse.data;
        setRoomInfo(roomData);

        // Kiểm tra trong settings nếu có
        if (roomData.settings || roomData.Settings) {
          const settings = roomData.settings || roomData.Settings;
        }

        // Check if current user is host
        let userId = localStorage.getItem('userId');

        // If userId not in localStorage, try to get from token
        if (!userId) {
          try {
            const token = localStorage.getItem('accessToken');
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              // Updated to include UserId and Id for compatibility
              userId = payload.userId || payload.userId || payload.sub || payload.id || payload.Id;
              if (userId) {
                localStorage.setItem('userId', userId);
              }
            }
          } catch (error) {
            
          }
        }

        // Kiểm tra xem người dùng hiện tại có phải là host không
        const hostId = roomData.hostId || roomData.HostId || roomData.ownerId || roomData.OwnerId;
        
        // So sánh cả loose (==) và strict với string conversion để handle cả string/number
        const isHostUser = hostId && (
            hostId == userId ||  // Loose comparison để handle string/number  
            hostId?.toString() === userId?.toString()
        );

        // Cập nhật trạng thái host trong store
        if (typeof setIsHost === 'function') {
          setIsHost(isHostUser);
        } else {
          
        }

        // Đồng thời gọi loadRoomDetails để load đầy đủ dữ liệu từ store
        // Store sẽ load players với isHost được set đúng
        loadRoomDetails(actualRoomCode);
        // Không cần await vì sẽ cập nhật async qua store

        // **IMPORTANT**: Ensure user is actually joined to the room
        // If user is room creator, they should already be in the room
        const roomId = roomData.id || roomData.Id;

        if (roomId) {
          const playersResponse = await roomsApi.getPlayersInRoom(roomId);

          if (playersResponse && playersResponse.status === 200) {
            const playersData = playersResponse.data || [];

            // Check if current user is in the players list
            const currentUserId = localStorage.getItem('userId');
            const userInRoom = playersData.find(p => 
              p.userId?.toString() === currentUserId?.toString()
            );
            
            if (!userInRoom && currentUserId) {
              
              try {
                const joinResponse = await roomsApi.joinRoomByCode(actualRoomCode);

                if (joinResponse.status === 200) {
                  
                  // Refresh players list after joining
                  setTimeout(() => {
                    loadRoomDetails(actualRoomCode);
                  }, 1000);
                } else {
                  
                }
              } catch (joinError) {
                
              }
            } else if (userInRoom) {
              
            } else {
              
            }
          } else {
            
          }
        }
      } else {
        throw new Error(roomResponse.message || 'Room not found');
      }
    } catch (error) {
      
      setRoomInfo(null);
      // Không cần setPlayers vì danh sách người chơi được quản lý bởi store
      setIsHost(false);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ chạy một lần khi component được mount
  useEffect(() => {
    // Lưu mã phòng hiện tại
    if (actualRoomCode) {
      localStorage.setItem('currentRoomCode', actualRoomCode);

      // Kiểm tra xem có cần tham gia lại phòng không
      const needsRejoin = localStorage.getItem('needsRejoin') === 'true';
      if (needsRejoin) {
        localStorage.removeItem('needsRejoin');

        // Chỉ gửi yêu cầu tham gia lại nếu WebSocket đã kết nối
        if (wsConnected) {
          joinRoomWS(actualRoomCode);
        }
      }
    }

    // Tải dữ liệu phòng
    loadData();

    // Khi component bị hủy nhưng không phải do rời phòng có chủ đích
    return () => {
      if (actualRoomCode) {
        localStorage.setItem('needsRejoin', 'true');
      }
    };
  }, [actualRoomCode]); // Chỉ phụ thuộc vào actualRoomCode

  // Thiết lập heartbeat để phát hiện mất kết nối
  useEffect(() => {
    if (!actualRoomCode) return;

    // Gửi heartbeat mỗi 30 giây để giữ kết nối hoạt động
    const heartbeatInterval = setInterval(() => {
      if (wsConnected) {
        // Gửi tín hiệu heartbeat
        import('../../services/websocketService.js').then(({ default: websocketService }) => {
          websocketService.send('heartbeat', {
            roomCode: actualRoomCode,
            userId: localStorage.getItem('userId')
          });
        }).catch(err => {
          // Ignore heartbeat errors
        });
      }
    }, 30000); // 30 giây

    // Dọn dẹp khi component bị hủy
    return () => {
      clearInterval(heartbeatInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualRoomCode]); // Chỉ phụ thuộc vào actualRoomCode

  // Xử lý kết nối WebSocket
  useEffect(() => {
    // Nếu WebSocket đã kết nối và có yêu cầu tham gia lại đang chờ
    if (wsConnected && actualRoomCode) {

      const pendingRejoin = localStorage.getItem('pendingRejoin');
      if (pendingRejoin && pendingRejoin === actualRoomCode) {
        
        joinRoomWS(actualRoomCode);
        localStorage.removeItem('pendingRejoin');
      } else {
        // Always ensure we join the room when WebSocket connects
        
        joinRoomWS(actualRoomCode);
      }
    }
  }, [wsConnected, actualRoomCode, joinRoomWS]); // Added joinRoomWS dependency

  // Kiểm tra trạng thái kết nối
  useEffect(() => {
    if (!actualRoomCode) return;

    // Kiểm tra trạng thái kết nối thường xuyên
    const connectionCheckInterval = setInterval(() => {
      import('../../services/websocketService.js').then(({ default: websocketService }) => {
        if (!websocketService.isConnected && actualRoomCode) {
          initWebSocket();
        }
      }).catch(err => {
        // Ignore websocket errors
      });
    }, 5000); // Kiểm tra mỗi 5 giây

    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [actualRoomCode, initWebSocket]);

  // Xử lý khi game bắt đầu - Fixed dependency issue
  useEffect(() => {
    if (!actualRoomCode) return;

    const handleGameStarted = (data) => {

      // Ensure localStorage data is set for game page
      const gameData = {
        roomCode: actualRoomCode,
        roomInfo: roomInfo,
        hostId: localStorage.getItem('userId'),
        isHost: isHost,
        players: players
      };
      localStorage.setItem('currentRoom', JSON.stringify(gameData));
      localStorage.setItem('gameStarted', 'true');
      
      // Navigate to game page
      navigate(`/game/${actualRoomCode}`);
    };

    // Listen for multiple event variations to ensure we catch it
    const setupGameStartedListeners = async () => {
      try {
        const { default: websocketService } = await import('../../services/websocketService.js');
        
        // Listen to multiple possible event names
        websocketService.on('game-started', handleGameStarted);
        websocketService.on('GAME_STARTED', handleGameStarted);
        websocketService.on('gameStarted', handleGameStarted);

      } catch (err) {
        
      }
    };

    setupGameStartedListeners();

    // Cleanup
    return () => {
      import('../../services/websocketService.js').then(({ default: websocketService }) => {
        websocketService.off('game-started', handleGameStarted);
        websocketService.off('GAME_STARTED', handleGameStarted);
        websocketService.off('gameStarted', handleGameStarted);
        
      }).catch(err => {
        // Ignore cleanup errors
      });
    };
  }, [actualRoomCode, navigate]);

  // WebSocket event handlers
  const handlePlayersUpdate = React.useCallback((mappedPlayers) => {
    if (!mappedPlayers || mappedPlayers.length === 0) {
      return;
    }

    // Kiểm tra xem người dùng hiện tại có trong danh sách không
    const currentUserId = localStorage.getItem('userId');
    const currentUserInList = mappedPlayers.some(player =>
      player.userId === parseInt(currentUserId) ||
      player.userId?.toString() === currentUserId
    );

    // Nếu người dùng hiện tại không có trong danh sách, thêm vào
    if (!currentUserInList && currentUserId && actualRoomCode) {
      // Yêu cầu tham gia lại phòng
      joinRoomWS(actualRoomCode);
    }

    // Chỉ xử lý hiệu ứng cho người chơi mới, không cập nhật danh sách players
    // vì danh sách players đã được cập nhật bởi store
    const newPlayers = mappedPlayers.filter(newPlayer =>
      !players.some(oldPlayer =>
        oldPlayer.userId === newPlayer.userId ||
        oldPlayer.userId?.toString() === newPlayer.userId?.toString()
      )
    );

    if (newPlayers.length > 0) {
      const newIds = newPlayers.map(player => player.userId);
      setNewPlayerIds(prevIds => [...prevIds, ...newIds]);
      setTimeout(() => {
        setNewPlayerIds(ids => ids.filter(id => !newIds.includes(id)));
      }, 3000);
    }

    // Kiểm tra trạng thái sẵn sàng của người dùng hiện tại - Không cần nữa vì mặc định ready
    // if (currentUserId) {
    //   const currentPlayer = mappedPlayers.find(p =>
    //     p.userId === parseInt(currentUserId) || p.userId?.toString() === currentUserId
    //   );
    //   if (currentPlayer && currentPlayer.isReady !== isReady) {
    //     setIsReady(currentPlayer.isReady || false);
    //   }
    // }
  }, [players, actualRoomCode, joinRoomWS]);

  const handleHostChange = React.useCallback((isHostOrId) => {
    
    // Xác định trạng thái host dựa trên tham số
    let isHostBoolean;

    if (typeof isHostOrId === 'boolean') {
      // Nếu tham số là boolean, sử dụng trực tiếp
      isHostBoolean = isHostOrId === true;
    } else if (isHostOrId) {
      // Nếu tham số là ID, so sánh với ID hiện tại
      const currentUserId = localStorage.getItem('userId');
      isHostBoolean =
        isHostOrId === parseInt(currentUserId) ||
        isHostOrId?.toString() === currentUserId;
    } else {
      // Nếu tham số là null/undefined, đặt là false
      isHostBoolean = false;
    }

    // Chỉ cập nhật nếu trạng thái thực sự thay đổi
    if (isHost !== isHostBoolean && typeof setIsHost === 'function') {
      setIsHost(isHostBoolean);
    }
  }, [isHost, setIsHost]);
  const handleHostUpdate = React.useCallback((newHostId) => {
    if (newHostId) {
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId && (newHostId === parseInt(currentUserId) || newHostId?.toString() === currentUserId)) {
        setIsHost(true);
      }
    }
  }, [setIsHost]);

  const handleLeaveRoom = React.useCallback(async () => {
    try {
      // Lấy userId hiện tại
      const currentUserId = localStorage.getItem('userId');

      // Xóa cờ tham gia lại và mã phòng để tránh tự động tham gia lại
      localStorage.removeItem('needsRejoin');
      localStorage.removeItem('currentRoomCode');
      localStorage.removeItem('pendingRejoin');

      // Gửi tin nhắn rời phòng qua WebSocket trước
      leaveRoomWS(actualRoomCode);

      // Thông báo cho các người chơi khác biết người chơi này đã rời phòng
      import('../../services/websocketService.js').then(({ default: websocketService }) => {
        websocketService.send('player-left', {
          roomCode: actualRoomCode,
          userId: currentUserId
        });

        // Gửi thêm sự kiện leave-room để đảm bảo server nhận được
        websocketService.send('leave-room', {
          roomCode: actualRoomCode,
          userId: currentUserId
        });

        // Yêu cầu cập nhật danh sách người chơi
        websocketService.send('request-players-update', { roomCode: actualRoomCode });
      });

      // Gọi API rời phòng
      const response = await roomsApi.leaveRoom(actualRoomCode);

      // Kiểm tra xem có nên xóa phòng không (nếu là host và chỉ có 1 người chơi)
      if (isHost && players.length <= 1) {
        try {
          const deleteResponse = await roomsApi.deleteRoom(actualRoomCode);
        } catch (deleteError) {
          
        }
      }

      // Chuyển hướng về trang danh sách phòng
      navigate('/rooms');

    } catch (error) {
      
      // Vẫn xóa mã phòng ngay cả khi có lỗi
      localStorage.removeItem('currentRoomCode');
      localStorage.removeItem('needsRejoin');
      localStorage.removeItem('pendingRejoin');
      navigate('/rooms');
    }
  }, [actualRoomCode, leaveRoomWS, isHost, players.length, navigate]);

  // Action handlers
  const handleStartGame = React.useCallback(async () => {
    let roomCodeToUse = null; // Declare at function scope
    
    try {

      // Verify room exists by checking room info
      if (!roomInfo) {
        throw new Error('Room information not available. Please refresh the page.');
      }

      // Double-check room code
      roomCodeToUse = actualRoomCode || roomInfo.roomCode || roomInfo.RoomCode;
      if (!roomCodeToUse) {
        throw new Error('Room code is missing. Cannot start game.');
      }

      // Verify room still exists in backend before starting game
      const verifyRoomResponse = await roomsApi.getRoomByCode(roomCodeToUse);
      if (!verifyRoomResponse || verifyRoomResponse.status !== 200) {
        
        throw new Error('Phòng không tồn tại hoặc đã bị xóa. Vui lòng tạo phòng mới.');
      }

      // Set up game data in localStorage before starting
      const gameData = {
        roomCode: roomCodeToUse,
        roomInfo: roomInfo,
        hostId: localStorage.getItem('userId'),
        isHost: isHost,
        players: players
      };
      localStorage.setItem('currentRoom', JSON.stringify(gameData));
      localStorage.setItem('gameStarted', 'true');

      // Get selected topics from roomInfo if available
      const selectedTopicIds = roomInfo?.selectedTopics || roomInfo?.topicIds || [1, 2, 3];
      const questionCount = roomInfo?.questionCount || 10;
      const timeLimit = roomInfo?.timeLimit || 30;

      // **TEMP FIX**: Skip backend API call, use direct WebSocket broadcast
      // This ensures ALL players get the game-started event immediately
      
      // Send WebSocket event to notify ALL players (including host) to start game
      import('../../services/websocketService.js').then(({ default: websocketService }) => {
        // Send startGame event - this should broadcast to ALL players
        websocketService.send('startGame', { 
          roomCode: roomCodeToUse,
          selectedTopicIds: selectedTopicIds,
          questionCount: questionCount,
          timeLimit: timeLimit
        });

        // **IMMEDIATE FIX**: Also emit game-started event directly to ensure all clients navigate
        setTimeout(() => {
          websocketService.emit('game-started', {
            roomCode: roomCodeToUse,
            gameSettings: {
              selectedTopicIds,
              questionCount,
              timeLimit
            }
          });
          
        }, 100);
      });

      // Show success notification - but DON'T navigate immediately
      // Let the WebSocket game-started event handle navigation for ALL players
      showNotification('Game đã bắt đầu! Đang chuyển sang màn hình chơi...', 'success');

    } catch (error) {

      // More specific error messages
      let errorMessage = 'Không thể bắt đầu game. Vui lòng thử lại!';
      if (error.errorCode === 'ROOM_NOT_FOUND' || error.message?.includes('không tồn tại')) {
        errorMessage = 'Phòng không tồn tại hoặc đã bị xóa. Vui lòng tạo phòng mới.';
      } else if (error.status === 401) {
        errorMessage = 'Bạn không có quyền bắt đầu game. Chỉ chủ phòng mới có thể bắt đầu.';
      } else if (error.status === 400) {
        errorMessage = 'Thông tin game không hợp lệ. Vui lòng kiểm tra cài đặt phòng.';
      }
      
      showNotification(errorMessage, 'error');
    }
  }, [actualRoomCode, roomInfo, isHost, players]);

  // Xóa handleReady vì không cần nữa

  // Get maxPlayers from room data
  const getMaxPlayers = React.useMemo(() => {
    if (!roomInfo) return 4;
    return roomInfo.maxPlayers || roomInfo.maxPlayers;
  }, [roomInfo]);

  // Memoized computed values to prevent unnecessary re-renders
  const memoizedValues = React.useMemo(() => {
    
    // Tính toán canStartGame - Sửa lại logic
    // Host không cần ready, chỉ cần tất cả người chơi khác (non-host) phải ready
    const nonHostPlayers = players.filter(p => !(p.isHost || p.isHost));
    const allNonHostPlayersReady = nonHostPlayers.every(p => p.isReady || p.isReady);
    
    // Điều kiện: isHost && có ít nhất 1 người chơi không phải host && tất cả non-host players đều ready
    const canStartGame = isHost && nonHostPlayers.length >= 1 && allNonHostPlayersReady;
    
    const maxPlayers = getMaxPlayers;

    // Find host player
    const hostPlayer = players.find(p => p.isHost || p.isHost);

    return {
      canStartGame,
      maxPlayers,
      hostPlayer
    };
  }, [isHost, players, getMaxPlayers]);

  const { canStartGame, maxPlayers, hostPlayer } = memoizedValues;

  if (loading) {
    return (
      <div className="waiting-room">
        <Header />
        <div className="waiting-container">
          <LoadingState />
        </div>
        <Footer />
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="waiting-room">
        <Header />
        <div className="waiting-container">
          <ErrorState onNavigateBack={() => navigate('/rooms')} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="waiting-room">
      <Header />
      <NotificationContainer />

      {/* WebSocket Handler - Xử lý các sự kiện real-time */}
      <WebSocketHandler
        wsConnected={wsConnected}
        actualRoomCode={actualRoomCode}
        initWebSocket={initWebSocket}
        joinRoomWS={joinRoomWS}
        leaveRoomWS={leaveRoomWS}
        setupWebSocketListeners={setupWebSocketListeners}
        cleanupWebSocketListeners={cleanupWebSocketListeners}
        onPlayersUpdate={handlePlayersUpdate}
        onHostChange={handleHostChange}
        onPlayerJoin={handlePlayerJoin}
        onPlayerLeave={handlePlayerLeave}
      />

      {/* Connection status indicator removed */}

      <div className="waiting-container">
        {/* Room Header */}
        <div className="room-header">
          <RoomHeader
            title={roomInfo?.roomName || roomInfo?.RoomName}
          />
          <RoomCodeCard roomCode={actualRoomCode} />
        </div>

        {/* Room Info */}
        <RoomInfoGrid
          roomInfo={roomInfo}
          topics={topics}
          maxPlayers={maxPlayers}
        />

        {/* Players Section */}
        <PlayersList
          players={players}
          newPlayerIds={newPlayerIds}
          maxPlayers={maxPlayers}
          host={hostPlayer}
          currentUserId={localStorage.getItem('userId')}
        />

        {/* Action Buttons */}
        <ActionButtons
          isHost={isHost}
          canStartGame={canStartGame}
          players={players}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>

      <Footer />
    </div>
  );
};

export default WaitingRoom;
