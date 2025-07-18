import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import CreateRoomModal from '../components/CreateRoomModal';
import RoomCard from '../components/RoomCard';
import JoinByCodeModal from '../components/JoinByCodeModal';
import useRoomStore from '../stores/useRoomStore';
import useUserStore from '../hooks/useUserStore';
import '../style/pages/RoomsPage.css';

const RoomsPage = () => {
  // Navigation and user management
  const navigate = useNavigate();
  const { userName, logout } = useUserStore();

  // Room management state and actions
  const {
    rooms,
    loading,
    error,
    loadRooms,
    joinRoom,
    clearError,
    startAutoRefresh,
    stopAutoRefresh
  } = useRoomStore();

  // Local component state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [success, setSuccess] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  /**
   * Initialize room data and auto-refresh on component mount
   * Cleanup auto-refresh on component unmount
   */
  useEffect(() => {
    loadRooms();
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, [loadRooms, startAutoRefresh, stopAutoRefresh]);

  /**
   * Handle joining a public room
   * @param {string} roomCode - The room code to join
   */
  const handleJoinPublic = async (roomCode) => {
    // Clear previous errors and messages
    setJoinError('');
    setSuccess('');
    clearError();

    const result = await joinRoom(roomCode, true);

    if (result.success) {
      setSuccess('Đang chuyển hướng vào phòng chờ...');
      const targetRoom = result.data?.Code || roomCode;
      navigate(`/waiting-room/${targetRoom}`);
    } else {
      setJoinError(result.error);
    }
  };

  /**
   * Handle joining a private room by code
   * @param {string} roomCode - The room code to join
   */
  const handleJoinPrivate = async (roomCode) => {
    setJoinLoading(true);
    setJoinError('');

    const result = await joinRoom(roomCode, false);

    if (result.success) {
      setSuccess('Đang chuyển hướng vào phòng chờ...');
      const targetRoom = result.data?.Code || roomCode;
      setShowJoinModal(false);
      navigate(`/waiting-room/${targetRoom}`);
    } else {
      setJoinError(result.error);
    }

    setJoinLoading(false);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    logout(navigate);
  };

  /**
   * Format remaining time for room display
   * @param {string} endTime - End time string
   * @returns {string} Formatted time string
   */
  const formatTimeLeft = (endTime) => {
    if (!endTime) return 'Không giới hạn';

    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Đã kết thúc';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rooms-page">
      <Header userName={userName} handleLogout={handleLogout} />

      <main className="rooms-content">
        <div className="container">
          <h1>Danh sách phòng</h1>

          <div className="room-actions">
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Tạo phòng mới
            </button>

            <button
              className="btn-secondary"
              onClick={() => setShowJoinModal(true)}
            >
              Tham gia bằng mã
            </button>


          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="rooms-grid">
              {rooms.length === 0 ? (
                <div className="no-rooms">
                  <p>Chưa có phòng nào</p>
                </div>
              ) : (
                rooms.map((room, index) => (
                  <RoomCard
                    key={room.RoomCode || `room-${index}`}
                    room={room}
                    onJoinPublic={handleJoinPublic}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRooms();
          }}
          onNavigateToRoom={(roomCode) => navigate(`/room/${roomCode}`)}
        />
      )}

      <JoinByCodeModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinError('');
        }}
        onJoin={handleJoinPrivate}
        loading={joinLoading}
        error={joinError}
      />

      {(error || joinError) && !showJoinModal && (
        <div className="notification error">
          {error || joinError}
          <button onClick={() => { clearError(); setJoinError(''); }}>
            <IoClose />
          </button>
        </div>
      )}

      {success && !showJoinModal && (
        <div className="notification success">
          {success}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
