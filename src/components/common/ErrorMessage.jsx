import React from 'react';
import PropTypes from 'prop-types';
import '../../style/components/common/ErrorMessage.css';

/**
 * Reusable Error Message Component
 */
const ErrorMessage = ({ 
    message = 'An error occurred', 
    onRetry = null, 
    onDismiss = null,
    className = '',
    type = 'error' // error, warning, info
}) => {
    const typeClass = `error-message-${type}`;
    
    return (
        <div className={`error-message-container ${typeClass} ${className}`}>
            <div className="error-icon">
                {type === 'error' && '⚠️'}
                {type === 'warning' && '⚠️'}
                {type === 'info' && 'ℹ️'}
            </div>
            
            <div className="error-content">
                <div className="error-text">
                    {message}
                </div>
                
                {(onRetry || onDismiss) && (
                    <div className="error-actions">
                        {onRetry && (
                            <button 
                                onClick={onRetry} 
                                className="error-btn retry-btn"
                            >
                                Try Again
                            </button>
                        )}
                        {onDismiss && (
                            <button 
                                onClick={onDismiss} 
                                className="error-btn dismiss-btn"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

ErrorMessage.propTypes = {
    message: PropTypes.string,
    onRetry: PropTypes.func,
    onDismiss: PropTypes.func,
    className: PropTypes.string,
    type: PropTypes.oneOf(['error', 'warning', 'info'])
};

export default ErrorMessage;
