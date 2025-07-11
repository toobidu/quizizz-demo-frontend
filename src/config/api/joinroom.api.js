import api from './apiInstance';

const getPublicRooms = async () => {
  return api.get('/rooms/public');
};

const joinPublicRoom = async (roomId) => {
  return api.post(`/rooms/${roomId}/join`);
};

const joinPrivateRoom = async (roomCode) => {
  return api.post('/rooms/join-private', { roomCode });
};

const leaveRoom = async (roomId) => {
  return api.delete(`/rooms/${roomId}/leave`);
};

const getRoomByCode = async (roomCode) => {
  return api.get(`/rooms/code/${roomCode}`);
};

const getPlayersInRoom = async (roomId) => {
  return api.get(`/rooms/${roomId}/players`);
};

export default {
  getPublicRooms,
  joinPublicRoom,
  joinPrivateRoom,
  leaveRoom,
  getRoomByCode,
  getPlayersInRoom
};