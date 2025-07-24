import React from 'react';
import {useNavigate} from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';

function ModalContainer() {
    const navigate = useNavigate();

    return (<>
        <CreateRoomModal onNavigateToRoom={(roomCode) => navigate(`/waiting-room/${roomCode}`)}/>
        {/* Các modal khác có thể được thêm vào đây */}
    </>);
}

export default ModalContainer;
