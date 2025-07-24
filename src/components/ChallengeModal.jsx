import React from 'react';
import {useNavigate} from 'react-router-dom';
import {FiPlusCircle, FiUsers, FiZap} from 'react-icons/fi';
import useUIStore from '../hooks/useUIStore';
import '../style/components/ChallengeModal.css';

function ChallengeModal({isOpen, onClose}) {
    const navigate = useNavigate();
    const {openCreateRoomModal} = useUIStore();

    if (!isOpen) return null;

    const handleCreateRoom = () => {
        onClose();
        openCreateRoomModal();
    };

    const handleJoinRoom = () => {
        navigate('/rooms');
        onClose();
    };

    return (<div className="cm-overlay">
        <div className="cm-container">
            <div className="cm-header">
                <h2 className="cm-title"><FiZap style={{marginRight: '8px'}}/> Chọn chế độ thử thách</h2>
                <button className="cm-close" onClick={onClose}>×</button>
            </div>
            <div className="cm-content">
                <button
                    className="cm-option cm-create"
                    onClick={handleCreateRoom}
                >
                    <div className="cm-icon-wrapper">
                        <FiPlusCircle className="cm-icon"/>
                    </div>
                    <div className="cm-option-text">
                        <span className="cm-option-title">Tạo phòng</span>
                        <span className="cm-option-desc">Tạo phòng mới và mời bạn bè</span>
                    </div>
                </button>
                <button
                    className="cm-option cm-join"
                    onClick={handleJoinRoom}
                >
                    <div className="cm-icon-wrapper">
                        <FiUsers className="cm-icon"/>
                    </div>
                    <div className="cm-option-text">
                        <span className="cm-option-title">Tham gia</span>
                        <span className="cm-option-desc">Tham gia phòng bằng mã phòng</span>
                    </div>
                </button>
            </div>
        </div>
    </div>);
}

export default ChallengeModal;
