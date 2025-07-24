import React, {useState} from 'react';
import {FiAlertCircle, FiHash, FiInfo, FiLogIn, FiX} from 'react-icons/fi';
import '../style/components/JoinByCodeModal.css';

const JoinByCodeModal = ({isOpen, onClose, onJoin, loading, error}) => {
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

    const handleOverlayClick = (e) => {
        // Chỉ đóng modal khi click vào overlay, không phải vào nội dung modal
        if (e.target.className === 'jbc-overlay') {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (<div className="jbc-overlay" onClick={handleOverlayClick}>
        <div className="jbc-container">
            <div className="jbc-header">
                <h2 className="jbc-title">Tham gia phòng thử thách</h2>
                <button className="jbc-close" onClick={handleClose}>
                    <FiX/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="jbc-form">
                <div className="jbc-form-group">
                    <label htmlFor="roomCode">
                        <FiHash/> Nhập mã phòng (6 ký tự)
                    </label>
                    <div className="jbc-code-input-container">
                        <input
                            id="roomCode"
                            type="text"
                            value={roomCode}
                            onChange={handleInputChange}
                            placeholder="NHẬP MÃ"
                            maxLength={6}
                            autoFocus
                            disabled={loading}
                            className="jbc-input"
                        />
                        <div className="jbc-code-icon">
                            <FiHash/>
                        </div>
                    </div>
                </div>

                {error && (<div className="jbc-error">
                    <FiAlertCircle/>
                    <span>{error}</span>
                </div>)}

                <div className="jbc-actions">
                    <button
                        type="button"
                        className="jbc-button jbc-secondary-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="jbc-button jbc-primary-btn"
                        disabled={!roomCode.trim() || loading}
                    >
                        {loading ? 'Đang tham gia...' : <><FiLogIn/> Tham gia phòng</>}
                    </button>
                </div>

                <div className="jbc-info">
                    <FiInfo style={{marginRight: '5px'}}/>
                    Mã phòng được chia sẻ bởi người tạo phòng
                </div>
            </form>
        </div>
    </div>);
};

export default JoinByCodeModal;
