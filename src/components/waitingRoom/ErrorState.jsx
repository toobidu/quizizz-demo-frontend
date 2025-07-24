import React from 'react';
import {FiAlertTriangle, FiArrowLeft} from 'react-icons/fi';

const ErrorState = ({onNavigateBack}) => {
    return (<div className="error-state">
        <FiAlertTriangle className="error-icon"/>
        <h2>Không tìm thấy phòng</h2>
        <p>Phòng có thể đã bị xóa hoặc không tồn tại</p>
        <button onClick={onNavigateBack} className="btn-leave">
            <FiArrowLeft/> Quay lại danh sách phòng
        </button>
    </div>);
};

export default ErrorState;
