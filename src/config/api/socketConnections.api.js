import apiInstance from './apiInstance';

/**
 * Socket Connections API Service
 * Handles socket connection management via HTTP API
 */

/**
 * Get socket connections for a room
 * @param {number} roomId - Room ID
 * @returns {Promise<Object>} - Socket connections data
 */
export const getRoomConnections = async (roomId) => {
    try {
        const response = await apiInstance.get(`/socket-connections/room/${roomId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Create a new socket connection record
 * @param {Object} data - Connection data
 * @param {string} data.socketId - Socket ID
 * @param {number} data.userId - User ID
 * @param {number} data.roomId - Room ID (optional)
 * @param {string} data.status - Connection status
 * @returns {Promise<Object>} - Created connection data
 */
export const createSocketConnection = async (data) => {
    try {
        const connectionData = {
            socketId: data.socketId,
            userId: data.userId,
            roomId: data.roomId,
            status: data.status || 'connected'
        };

        const response = await apiInstance.post('/socket-connections', connectionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Delete a socket connection
 * @param {string} socketId - Socket ID
 * @returns {Promise<Object>} - Delete result
 */
export const deleteSocketConnection = async (socketId) => {
    try {
        const response = await apiInstance.delete(`/socket-connections/${socketId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Update socket connection status
 * @param {string} socketId - Socket ID
 * @param {Object} data - Update data
 * @param {string} data.status - New status
 * @param {number} data.roomId - Room ID (optional)
 * @returns {Promise<Object>} - Updated connection data
 */
export const updateSocketConnection = async (socketId, data) => {
    try {
        const response = await apiInstance.put(`/socket-connections/${socketId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get user's active connections
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User's active connections
 */
export const getUserConnections = async (userId) => {
    try {
        const response = await apiInstance.get(`/socket-connections/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Cleanup stale connections (admin function)
 * @param {number} olderThanMinutes - Remove connections older than X minutes
 * @returns {Promise<Object>} - Cleanup result
 */
export const cleanupStaleConnections = async (olderThanMinutes = 30) => {
    try {
        const response = await apiInstance.post('/socket-connections/cleanup', {
            olderThanMinutes
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
