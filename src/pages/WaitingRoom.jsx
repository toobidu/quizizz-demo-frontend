import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import topicsApi from '../config/api/topics.api';
import roomsApi from '../config/api/roomsList.api';
import useRoomStore from '../stores/useRoomStore';
import '../style/pages/WaitingRoom.css';
import RoomHeader from '../components/waitingRoom/RoomHeader';
import RoomCodeCard from '../components/waitingRoom/RoomCodeCard';
import RoomInfoGrid from '../components/waitingRoom/RoomInfoGrid';
import PlayersList from '../components/waitingRoom/PlayersList';
import ActionButtons from '../components/waitingRoom/ActionButtons';
import WebSocketHandler from '../components/waitingRoom/WebSocketHandler';
import LoadingState from '../components/waitingRoom/LoadingState';
import ErrorState from '../components/waitingRoom/ErrorState';

const WaitingRoom = ({ roomId }) => {
  const { roomCode } = useParams();
  const actualRoomCode = roomId || roomCode;
  const navigate = useNavigate();

  // State management
  const [players, setPlayers] = useState([]);
  const [previousPlayers, setPreviousPlayers] = useState([]);
  const [newPlayerIds, setNewPlayerIds] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Get WebSocket functions from store
  const {
    initWebSocket,
    joinRoomWS,
    leaveRoomWS,
    playerReadyWS,
    wsConnected,
    setupWebSocketListeners,
    cleanupWebSocketListeners
  } = useRoomStore();

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load room data
  const loadData = async () => {
    setLoading(true);

    try {
      console.log('[LOADING] Loading data for room:', actualRoomCode);

      // Load topics
      const topicsResponse = await topicsApi.getAllTopics();
      if (topicsResponse && (topicsResponse.Status === 200 || topicsResponse.status === 200)) {
        setTopics(topicsResponse.Data || []);
      }

      // Load room data
      const roomResponse = await roomsApi.getRoomByCode(actualRoomCode);
      console.log('[ROOM] Room response:', roomResponse);

      if (roomResponse && (roomResponse.Status === 200 || roomResponse.status === 200)) {
        const roomData = roomResponse.Data || roomResponse.data;
        setRoomInfo(roomData);
        console.log('[ROOM] Room info:', roomData);

        // Check if current user is host
        let userId = localStorage.getItem('userId');

        // If userId not in localStorage, try to get from token
        if (!userId) {
          try {
            const token = localStorage.getItem('accessToken');
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              userId = payload.userId || payload.sub || payload.id;
              if (userId) {
                localStorage.setItem('userId', userId);
              }
            }
          } catch (error) {
            console.error('[TOKEN] Error getting userId from token:', error);
          }
        }

        console.log('[USER] Current user ID:', userId);

        const isHostUser = roomData.hostId === parseInt(userId) || roomData.HostId === parseInt(userId);
        setIsHost(isHostUser);
        console.log('[HOST] Is host?', isHostUser);

        // Get players in room
        const roomId = roomData.id || roomData.Id;
        if (roomId) {
          const playersResponse = await roomsApi.getPlayersInRoom(roomId);
          console.log("[PLAYERS] Players list from API:", playersResponse);

          if (playersResponse && (playersResponse.Status === 200 || playersResponse.status === 200)) {
            const playersData = playersResponse.Data || playersResponse.data || [];
            console.log("[PLAYERS] Processed players list:", playersData);

            setPlayers(playersData);

            // Check ready status of current user
            const currentPlayer = playersData.find(p => p.UserId === parseInt(userId));
            console.log('[PLAYER] Current player info:', currentPlayer);

            if (currentPlayer) {
              setIsReady(currentPlayer.isReady || currentPlayer.IsReady || false);
            }
          }
        }
      } else {
        throw new Error(roomResponse.Message || 'Room not found');
      }
    } catch (error) {
      console.error('[ERROR] Error loading data:', error);
      setRoomInfo(null);
      setPlayers([]);
      setIsHost(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actualRoomCode]);

  // WebSocket event handlers
  const handlePlayersUpdate = (mappedPlayers, host) => {
    // Save current players list for comparison
    setPreviousPlayers([...players]);

    // Find new players (not in previous list)
    const newPlayers = mappedPlayers.filter(newPlayer =>
      !players.some(oldPlayer => oldPlayer.userId === newPlayer.userId)
    );

    // Save IDs of new players for animation
    if (newPlayers.length > 0) {
      const newIds = newPlayers.map(player => player.userId);
      console.log('[WAITING ROOM] New players:', newIds);
      setNewPlayerIds(newIds);

      // Auto-remove animation after 3 seconds
      setTimeout(() => {
        setNewPlayerIds([]);
      }, 3000);
    }

    setPlayers(mappedPlayers);

    // Update host status for current user
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      const currentPlayer = mappedPlayers.find(p => p.userId === parseInt(currentUserId));
      if (currentPlayer) {
        setIsHost(currentPlayer.isHost || false);
        setIsReady(currentPlayer.isReady || false);
      }
    }
  };

  const handleHostChange = (newHostId) => {
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId && (newHostId === parseInt(currentUserId) || newHostId?.toString() === currentUserId)) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }

    // Update players list to reflect host change
    setPlayers(prev => prev.map(player => ({
      ...player,
      isHost: player.userId === newHostId || player.userId?.toString() === newHostId?.toString()
    })));
  };

  const handlePlayerJoin = (newPlayer) => {
    setPlayers(prevPlayers => {
      // Check if player already exists
      const playerExists = prevPlayers.some(p => p.userId === newPlayer.userId);
      if (playerExists) {
        return prevPlayers;
      }

      // Add new player animation
      setNewPlayerIds(ids => [...ids, newPlayer.userId]);

      // Auto-remove animation after 3 seconds
      setTimeout(() => {
        setNewPlayerIds(ids => ids.filter(id => id !== newPlayer.userId));
      }, 3000);

      return [...prevPlayers, newPlayer];
    });
  };

  const handlePlayerLeave = (userId, newHostId) => {
    // Remove player from list
    setPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.filter(player =>
        player.userId !== userId &&
        player.userId?.toString() !== userId?.toString()
      );

      // Update host if needed
      if (newHostId) {
        return updatedPlayers.map(player => ({
          ...player,
          isHost: player.userId === newHostId || player.userId?.toString() === newHostId?.toString()
        }));
      }

      return updatedPlayers;
    });

    // Check if current user is new host
    if (newHostId) {
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId && (newHostId === parseInt(currentUserId) || newHostId?.toString() === currentUserId)) {
        console.log('[WAITING ROOM] You are now the host!');
        setIsHost(true);
      }
    }
  };

  // Action handlers
  const handleStartGame = () => {
    // Send start game via WebSocket
    import('../services/websocketService').then(({ default: websocketService }) => {
      websocketService.send('startGame', { roomCode: actualRoomCode });
    });

    navigate(`/game/${actualRoomCode}`);
  };

  const handleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);

    // Send via WebSocket
    playerReadyWS(actualRoomCode, newReadyState);

    // Update local state immediately for better UX
    let userId = localStorage.getItem('userId');
    if (!userId) {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.sub || payload.id;
        }
      } catch (error) {
        console.error('[TOKEN] Error getting userId from token:', error);
      }
    }

    setPlayers(players.map(player =>
      player.userId === parseInt(userId)
        ? { ...player, isReady: newReadyState }
        : player
    ));
  };

  const handleLeaveRoom = async () => {
    try {
      // Send leave message via WebSocket
      leaveRoomWS(actualRoomCode);
      console.log('[WEBSOCKET] Leave message sent');

      // Call leave room API
      console.log('[API] Calling leaveRoom...');
      const response = await roomsApi.leaveRoom(actualRoomCode);
      console.log('[API] Leave room response:', response);

      // Check if room should be deleted (if host and only 1 player)
      if (isHost && players.length <= 1) {
        console.log('[HOST] Host leaving - trying to delete room');
        try {
          const deleteResponse = await roomsApi.deleteRoom(actualRoomCode);
          console.log('[API] Delete room response:', deleteResponse);
        } catch (deleteError) {
          console.error('[API] Error deleting room:', deleteError);
        }
      }

      navigate('/rooms');
    } catch (error) {
      console.error('[LEAVE ROOM] Error leaving room:', error);
      navigate('/rooms');
    }
  };

  // Get maxPlayers from room data
  const getMaxPlayers = () => {
    if (!roomInfo) return 4;
    return roomInfo.maxPlayers || roomInfo.MaxPlayers;
  };

  // Check if game can be started
  const canStartGame = isHost && players.length >= 2 && players.every(p => p.isReady || p.IsReady);
  const maxPlayers = getMaxPlayers();

  // Find host player
  const hostPlayer = players.find(p => p.isHost || p.IsHost);

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

      <div className="waiting-container">
        {/* Room Header */}
        <div className="room-header">
          <RoomHeader
            title={roomInfo?.roomName || roomInfo?.RoomName}
            timeLeft={timeLeft}
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
        />

        {/* Action Buttons */}
        <ActionButtons
          isHost={isHost}
          isReady={isReady}
          canStartGame={canStartGame}
          players={players}
          onStartGame={handleStartGame}
          onReady={handleReady}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>

      <Footer />
    </div>
  );
};

export default WaitingRoom;
