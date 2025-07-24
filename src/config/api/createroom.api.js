import api from './apiInstance';
import Cookies from 'js-cookie';

const createRoom = async (payload) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');

    try {
        const response = await api.post('/rooms/create', payload, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'
            }
        });
        return response.data; // Trả về response.data thay vì response
    } catch (error) {
        
        throw error;
    }
};

const getMyCurrentRoom = async () => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.get('/rooms/my-current', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

const joinRoom = async (roomId) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.post(`/rooms/${roomId}/join`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

const updateRoomSettings = async (roomId, settings) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.put(`/rooms/${roomId}/settings`, settings, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

const kickPlayer = async (roomId, playerId) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.delete(`/rooms/${roomId}/players/${playerId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

const updateRoomStatus = async (roomId, status) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.put(`/rooms/${roomId}/status`, {status}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

const deleteRoom = async (roomId) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.delete(`/rooms/${roomId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

const transferOwnership = async (roomId, newOwnerId) => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
    return api.put(`/rooms/${roomId}/transfer`, {newOwnerId}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

export default {
    createRoom,
    getMyCurrentRoom,
    joinRoom,
    updateRoomSettings,
    kickPlayer,
    updateRoomStatus,
    deleteRoom,
    transferOwnership
};
