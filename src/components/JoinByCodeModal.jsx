import React, { useState } from 'react';
import '../style/components/JoinByCodeModal.css';

const JoinByCodeModal = ({ isOpen, onClose, onJoin, loading, error }) => {
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoin(roomCode.trim().toUpperCase());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setRoomCode(value);
    }
  };

  const handleClose = () => {
    setRoomCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tham gia phòng bằng mã</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="join-form">
          <div className="input-group">
            <label htmlFor="roomCode">Mã phòng (6 ký tự)</label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={handleInputChange}
              placeholder="Nhập mã phòng"
              maxLength={6}
              autoFocus
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!roomCode.trim() || loading}
            >
              {loading ? 'Đang tham gia...' : 'Tham gia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinByCodeModal;