import React, {useEffect, useRef, useState} from 'react';
import useWebSocketRoom from '../hooks/useWebSocketRoom';
import {useRoomEvents} from '../hooks/useWebSocketEvents';
import '../style/components/RoomPlayersRealtime.css';
import RoomHeader from './roomPlayers/RoomHeader';
import HostInfo from './roomPlayers/HostInfo';
import PlayersList from './roomPlayers/PlayersList';
import NotificationList from './roomPlayers/NotificationList';
import WebSocketHandler from './roomPlayers/WebSocketHandler';
import useNotificationManager from './roomPlayers/NotificationManager';

const RoomPlayersRealtime = ({roomCode, initialPlayers = []}) => {
    const [players, setPlayers] = useState(initialPlayers);
    const [host, setHost] = useState(null);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [newPlayerIds, setNewPlayerIds] = useState([]);
    const prevPlayersRef = useRef([]);

    // Use notification manager hook
    const {notifications, addNotification} = useNotificationManager();

    // Use WebSocket hook
    const {
        isConnected, players: wsPlayers, newPlayerIds: wsNewPlayerIds
    } = useWebSocketRoom(roomCode);

    // Initialize player list from initial props
    useEffect(() => {
        if (initialPlayers && initialPlayers.length > 0) {
            setPlayers(initialPlayers);
            prevPlayersRef.current = initialPlayers;

            // Find host in initial list
            const initialHost = initialPlayers.find(p => p.isHost);
            if (initialHost) {
                setHost(initialHost);
            }

            setTotalPlayers(initialPlayers.length);
        }
    }, [initialPlayers]);

    // Update player list from WebSocket
    useEffect(() => {
        if (wsPlayers && wsPlayers.length > 0) {
            // Save current list for comparison
            const currentPlayerIds = players.map(p => p.userId || p.id || '');

            // Find new players
            const justJoinedPlayers = wsPlayers.filter(player => player.userId && !currentPlayerIds.includes(player.userId));

            // Update state
            setPlayers(wsPlayers);
            setTotalPlayers(wsPlayers.length);
            setLastUpdate(new Date());

            // Find new host
            const newHost = wsPlayers.find(p => p.isHost);
            if (newHost) {
                setHost(newHost);
            }

            // Add notification for new players
            justJoinedPlayers.forEach(player => {
                addNotification(`${player.username} đã tham gia phòng!`, 'success');
            });

            // Save current list for next comparison
            prevPlayersRef.current = wsPlayers;
        }
    }, [wsPlayers]);

    // Update new player IDs from WebSocket
    useEffect(() => {
        if (wsNewPlayerIds && wsNewPlayerIds.length > 0) {
            // Update new player IDs
            setNewPlayerIds(prev => [...prev, ...wsNewPlayerIds]);

            // Clear effect after 3 seconds
            setTimeout(() => {
                setNewPlayerIds([]);
            }, 3000);
        }
    }, [wsNewPlayerIds]);

    // Handle player joined event
    const handlePlayerJoined = (normalizedPlayer) => {
        // Add new player to list
        setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers, normalizedPlayer];
            prevPlayersRef.current = updatedPlayers;
            return updatedPlayers;
        });

        // Update total players
        setTotalPlayers(prev => prev + 1);

        // Mark new player for animation
        setNewPlayerIds(prev => [...prev, normalizedPlayer.userId]);

        // Add notification
        addNotification(`${normalizedPlayer.username} đã tham gia phòng!`, 'success');

        // Clear animation after 3 seconds
        setTimeout(() => {
            setNewPlayerIds(prev => prev.filter(id => id !== normalizedPlayer.userId));
        }, 3000);
    };

    // Handle player left event
    const handlePlayerLeft = (playerData) => {
        // Get userId from player data
        const userId = playerData.userId || playerData.userId || playerData.id || playerData.Id;
        if (!userId) return;

        // Find player in current list
        const leavingPlayer = players.find(p => {
            const playerId = p.userId || p.userId || p.id || p.Id;
            return playerId === userId;
        });

        if (leavingPlayer) {
            const username = leavingPlayer.username || leavingPlayer.username || 'Unknown';

            // Update players list
            setPlayers(prevPlayers => {
                const updatedPlayers = prevPlayers.filter(p => {
                    const playerId = p.userId || p.userId || p.id || p.Id;
                    return playerId !== userId;
                });
                prevPlayersRef.current = updatedPlayers;
                return updatedPlayers;
            });

            // Update total players
            setTotalPlayers(prev => Math.max(0, prev - 1));

            // Add notification
            addNotification(`${username} đã rời phòng!`, 'warning');
        }
    };

    // Handle players updated event
    const handlePlayersUpdated = (normalizedPlayers, newHost, newTotalPlayers, newMaxPlayers) => {
        const currentPlayerIds = prevPlayersRef.current.map(p => p.userId || p.userId || p.id || p.Id).filter(Boolean);

        // Find new players
        const justJoinedPlayers = normalizedPlayers.filter(player => player.userId && !currentPlayerIds.includes(player.userId));

        // Update state
        setPlayers(normalizedPlayers);
        setHost(newHost);
        setTotalPlayers(newTotalPlayers || normalizedPlayers.length || 0);
        setMaxPlayers(newMaxPlayers || 10);
        setLastUpdate(new Date());

        // Mark new players for animation
        if (justJoinedPlayers.length > 0) {
            const newIds = justJoinedPlayers.map(p => p.userId);
            setNewPlayerIds(prev => [...prev, ...newIds]);

            // Add notification for new players
            justJoinedPlayers.forEach(player => {
                addNotification(`${player.username} đã tham gia phòng!`, 'success');
            });

            // Clear animation after 3 seconds
            setTimeout(() => {
                setNewPlayerIds(prev => prev.filter(id => !newIds.includes(id)));
            }, 3000);
        } else if (normalizedPlayers.length !== prevPlayersRef.current.length) {
            // Add notification for player count change
            addNotification(`Cập nhật: ${newTotalPlayers || normalizedPlayers.length} người chơi trong phòng`);
        }

        // Save current list for next comparison
        prevPlayersRef.current = normalizedPlayers;
    };

    // Listen for room events
    useRoomEvents({
        onPlayersUpdate: (data) => {
        },

        onPlayerJoined: (playerData) => {
        },

        onPlayerLeft: (playerData) => {
            handlePlayerLeft(playerData);
        },

        onRoomDeleted: (data) => {
            if (data.roomCode === roomCode) {
                addNotification('Phòng đã bị xóa!', 'error');
            }
        },

        onHostChanged: (hostData) => {
            addNotification(`${hostData.username} đã trở thành host mới!`, 'info');
        }
    }, roomCode);

    // Format join time
    const formatJoinTime = (joinTime) => {
        if (!joinTime) return '';
        return new Date(joinTime).toLocaleTimeString();
    };

    return (<div className="room-players-realtime">
        {/* Room Header */}
        <RoomHeader
            totalPlayers={totalPlayers}
            maxPlayers={maxPlayers}
            lastUpdate={lastUpdate}
            isConnected={isConnected}
        />

        {/* Host Information */}
        <HostInfo host={host}/>

        {/* Players List */}
        <PlayersList
            players={players}
            newPlayerIds={newPlayerIds}
            formatJoinTime={formatJoinTime}
        />

        {/* Notifications */}
        <NotificationList notifications={notifications}/>

        {/* WebSocket Handler (no UI) */}
        <WebSocketHandler
            roomCode={roomCode}
            players={players}
            onPlayerJoined={handlePlayerJoined}
            onPlayersUpdated={handlePlayersUpdated}
            onPlayerLeft={handlePlayerLeft}
        />
    </div>);
};

export default RoomPlayersRealtime;
