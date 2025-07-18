import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const RoomCodeCard = ({ roomCode }) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room-code-card">
      <div className="code-label">Mã phòng</div>
      <div className="code-display">
        <span className="code-text">{roomCode}</span>
        <button
          onClick={copyRoomCode}
          className={`copy-btn ${copied ? 'copied' : ''}`}
          title="Sao chép mã phòng"
        >
          {copied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
      {copied && <div className="copy-success">Đã sao chép!</div>}
    </div>
  );
};

export default RoomCodeCard;