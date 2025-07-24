import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose, IoAdd, IoEnter, IoRefresh, IoSearch } from 'react-icons/io5';
import Header from '../../layouts/Header.jsx';
import Footer from '../../layouts/Footer.jsx';
import CreateRoomModal from '../../components/CreateRoomModal.jsx';
import RoomCard from '../../components/RoomCard.jsx';
import JoinByCodeModal from '../../components/JoinByCodeModal.jsx';
import useRoomStore from '../../stores/useRoomStore.js';
import useUserStore from '../../hooks/useUserStore.js';
import '../../style/pages/room/RoomsPage.css';

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
  const [searchQuery, setSearchQuery] = useState('');

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

    // Validation
    if (!roomCode) {
      
      setJoinError('Mã phòng không hợp lệ');
      return;
    }

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
    <div className="room-page">
      <Header userName={userName} handleLogout={handleLogout} />

      <main className="room-content">
        <div className="room-container">
          <div className="room-wrapper">
            <div className="room-header">
              <h1>Danh sách phòng</h1>

              <div className="room-actions">
                <button
                  className="room-btn-action room-btn-create"
                  onClick={() => setShowCreateModal(true)}
                >
                  <IoAdd className="room-btn-icon" />
                  <span>Tạo phòng mới</span>
                </button>
                <button
                  className="room-btn-action room-btn-join"
                  onClick={() => setShowJoinModal(true)}
                >
                  <IoEnter className="room-btn-icon" />
                  <span>Tham gia bằng mã</span>
                </button>
                <button
                  className="room-btn-action room-btn-refresh"
                  onClick={loadRooms}
                  disabled={loading}
                >
                  <IoRefresh className={`room-btn-icon ${loading ? 'room-spinning' : ''}`} />
                  <span className="room-btn-text-sm">Làm mới</span>
                </button>
              </div>
            </div>

            <div className="room-filter">
              <div className="room-search-container">
                <IoSearch className="room-search-icon" />
                <input
                  type="text"
                  className="room-search-input"
                  placeholder="Tìm kiếm phòng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading && rooms.length === 0 ? (
              <div className="room-loading-container">
                <div className="room-loading-spinner">
                  <IoRefresh className="room-spinner-icon" />
                </div>
                <p>Đang tải danh sách phòng...</p>
              </div>
            ) : (
              <div className="room-grid">
                {rooms.length === 0 ? (
                  <div className="room-empty">
                    <div className="room-empty-icon">
                      <IoSearch size={48} />
                    </div>
                    <h3>Không tìm thấy phòng nào</h3>
                    <p>Hãy tạo phòng mới hoặc tham gia bằng mã phòng</p>
                  </div>
                ) : (
                  rooms
                    .filter(room => {
                      if (!searchQuery) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        (room.RoomName && room.RoomName.toLowerCase().includes(query)) ||
                        (room.TopicName && room.TopicName.toLowerCase().includes(query)) ||
                        (room.RoomCode && room.RoomCode.toLowerCase().includes(query))
                      );
                    })
                    .map((room, index) => (
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
        <div className="room-notification room-error">
          {error || joinError}
          <button onClick={() => { clearError(); setJoinError(''); }}>
            <IoClose />
          </button>
        </div>
      )}

      {success && !showJoinModal && (
        <div className="room-notification room-success">
          {success}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
