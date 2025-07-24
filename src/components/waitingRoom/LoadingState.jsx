import React from 'react';

const LoadingState = () => {
    return (<div className="loading-state">
        <div className="spinner"></div>
        <h2>Đang tải thông tin phòng...</h2>
        <p>Vui lòng đợi trong giây lát</p>
    </div>);
};

export default LoadingState;
