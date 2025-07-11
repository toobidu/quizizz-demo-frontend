import api from './apiInstance';

const createRoom = async (payload) => {
  return api.post('/rooms/create', payload);
};

const updateRoomSettings = async (roomId, settings) => {
  return api.put(`/rooms/${roomId}/settings`, settings);
};

const kickPlayer = async (roomId, playerId) => {
  return api.delete(`/rooms/${roomId}/players/${playerId}`);
};

const updateRoomStatus = async (roomId, status) => {
  return api.put(`/rooms/${roomId}/status`, { status });
};

const deleteRoom = async (roomId) => {
  return api.delete(`/rooms/${roomId}`);
};

const transferOwnership = async (roomId, newOwnerId) => {
  return api.put(`/rooms/${roomId}/transfer`, { newOwnerId });
};

export default {
  createRoom,
  updateRoomSettings,
  kickPlayer,
  updateRoomStatus,
  deleteRoom,
  transferOwnership
};