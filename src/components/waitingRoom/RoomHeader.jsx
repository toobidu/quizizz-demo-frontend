import React from 'react';
import {FiUsers} from 'react-icons/fi';

const RoomHeader = ({title}) => {
    return (<div className="room-title">
        <h1>{title || 'Phòng chơi game'}</h1>
        <div className="room-subtitle">
            <FiUsers/> Đang chờ người chơi tham gia...
        </div>
    </div>);
};

export default RoomHeader;
