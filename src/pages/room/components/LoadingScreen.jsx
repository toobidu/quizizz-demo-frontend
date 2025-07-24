import React from 'react';

/**
 * Component hiển thị màn hình loading khi đang tải thông tin phòng
 */
const LoadingScreen = () => {
  return (
    <div className="waiting-room-container">
      <div className="loading-overlay">
        <div className="loading-animation"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;