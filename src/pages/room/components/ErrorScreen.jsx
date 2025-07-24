import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị thông báo lỗi
 * @param {Object} props - Component props
 * @param {string} props.message - Thông báo lỗi cần hiển thị
 * @param {string} props.title - Tiêu đề lỗi (optional)
 */
const ErrorScreen = ({ message, title = 'Lỗi' }) => {
  const navigate = useNavigate();
  
  return (
    <div className="waiting-room-container">
      <div className="error">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={() => navigate('/rooms')}>Quay lại danh sách phòng</button>
      </div>
    </div>
  );
};

export default ErrorScreen;