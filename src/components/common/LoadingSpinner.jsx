import React from 'react';
import PropTypes from 'prop-types';
import '../../style/components/common/LoadingSpinner.css';

/**
 * Reusable Loading Spinner Component
 */
const LoadingSpinner = ({ size = 'medium', message = 'Loading...', className = '' }) => {
    const sizeClass = `spinner-${size}`;
    
    return (
        <div className={`loading-spinner-container ${className}`}>
            <div className={`loading-spinner ${sizeClass}`}>
                <div className="spinner-circle"></div>
            </div>
            {message && (
                <div className="loading-message">
                    {message}
                </div>
            )}
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    message: PropTypes.string,
    className: PropTypes.string
};

export default LoadingSpinner;
