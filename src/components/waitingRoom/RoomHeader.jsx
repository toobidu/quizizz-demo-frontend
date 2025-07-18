import React from 'react';
import { FiClock } from 'react-icons/fi';

const RoomHeader = ({ title, timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="room-title">
      <h1>{title || 'Phòng chơi game'}</h1>
      <div className="room-timer">
        <FiClock className="timer-icon" />
        <span className="timer-text">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};

export default RoomHeader;