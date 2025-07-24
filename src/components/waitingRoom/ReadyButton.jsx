import React from 'react';
import PropTypes from 'prop-types';
import '../../style/pages/room/waitingRoom/ReadyButton.css';

/**
 * Nút sẵn sàng cho người chơi
 */
const ReadyButton = ({isReady, onToggleReady, disabled}) => {
    return (<button
        className={`ready-button ${isReady ? 'ready' : 'not-ready'}`}
        onClick={() => onToggleReady(!isReady)}
        disabled={disabled}
    >
        {isReady ? 'Đã sẵn sàng' : 'Sẵn sàng'}
    </button>);
};

ReadyButton.propTypes = {
    isReady: PropTypes.bool.isRequired, onToggleReady: PropTypes.func.isRequired, disabled: PropTypes.bool
};

ReadyButton.defaultProps = {
    disabled: false
};

export default ReadyButton;
