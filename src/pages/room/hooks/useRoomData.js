import { useState, useEffect } from 'react';

/**
 * Custom hook để quản lý dữ liệu phòng
 * @param {Object} params - Tham số
 * @param {string} params.roomCode - Mã phòng
 * @param {Function} params.loadRoomDetails - Hàm tải thông tin phòng từ store
 * @param {Object} params.currentRoom - Thông tin phòng hiện tại từ store
 * @returns {Object} Dữ liệu phòng và trạng thái loading
 */
const useRoomData = ({ roomCode, loadRoomDetails, currentRoom }) => {
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tải thông tin phòng
  useEffect(() => {
    if (roomCode) {
      setLoading(true);
      loadRoomDetails(roomCode)
        .then(() => {
          setLoading(false);
        })
        .catch(err => {
          
          setError(err.message || 'Không thể tải thông tin phòng');
          setLoading(false);
        });
    }
  }, [roomCode, loadRoomDetails]);

  // Cập nhật roomInfo từ store
  useEffect(() => {
    if (currentRoom) {
      setRoomInfo(currentRoom);
    }
  }, [currentRoom]);

  return { roomInfo, loading, error };
};

export default useRoomData;