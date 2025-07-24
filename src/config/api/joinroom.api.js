import api from './apiInstance';

const getPublicRooms = async () => {
    return api.get('/rooms/public');
};

const joinPublicRoom = async (roomCode) => {
    return api.post(`/rooms/${roomCode}/join`);
};

const joinPrivateRoom = async (roomCode) => {
    return api.post(`/rooms/${roomCode}/join`);
};

const leaveRoom = async (roomCode) => {
    return api.post(`/rooms/${roomCode}/leave`);
};

const getRoomByCode = async (roomCode) => {
    return api.get(`/rooms/code/${roomCode}`);
};

const getPlayersInRoom = async (roomId) => {
    return api.get(`/rooms/${roomId}/players`);
};

export default {
    getPublicRooms, joinPublicRoom, joinPrivateRoom, leaveRoom, getRoomByCode, getPlayersInRoom
};
