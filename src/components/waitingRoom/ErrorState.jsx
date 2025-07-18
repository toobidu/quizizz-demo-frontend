import React from 'react';
import { FiX } from 'react-icons/fi';

const ErrorState = ({ onNavigateBack }) => {
  return (
    <div className="error-message">
      <FiX className="error-icon" />
      <h3>Không tìm thấy phòng</h3>
      <p>Phòng có thể đã bị xóa hoặc không tồn tại</p>
      <button onClick={onNavigateBack} className="btn-primary">
        Quay lại danh sách phòng
      </button>
    </div>
  );
};

export default ErrorState;