import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../style/components/gameScreen/EnhancedCountdownScreen.css';

/**
 * Enhanced Countdown Screen with synchronized countdown for all players
 */
const EnhancedCountdownScreen = ({ 
    initialValue = 3, 
    onCountdownComplete = null,
    title = "Game Starting Soon!",
    subtitle = "Get Ready...",
    showTitle = true
}) => {
    const [countdownValue, setCountdownValue] = useState(initialValue);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setCountdownValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (countdownValue <= 0) {
            if (onCountdownComplete) {
                setTimeout(() => {
                    onCountdownComplete();
                }, 500);
            }
            return;
        }

        setIsAnimating(true);
        
        const timer = setTimeout(() => {
            setCountdownValue(prev => prev - 1);
            setIsAnimating(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdownValue, onCountdownComplete]);

    const getCountdownText = () => {
        if (countdownValue <= 0) {
            return "GO!";
        }
        return countdownValue.toString();
    };

    const getCountdownClass = () => {
        let className = 'countdown-number';
        
        if (isAnimating) {
            className += ' animating';
        }
        
        if (countdownValue <= 0) {
            className += ' go';
        } else if (countdownValue === 1) {
            className += ' final';
        }
        
        return className;
    };

    return (
        <div className="enhanced-countdown-screen">
            <div className="countdown-container">
                {showTitle && (
                    <div className="countdown-header">
                        <h1 className="countdown-title">{title}</h1>
                        <p className="countdown-subtitle">{subtitle}</p>
                    </div>
                )}
                
                <div className="countdown-display">
                    <div className={getCountdownClass()}>
                        {getCountdownText()}
                    </div>
                </div>
                
                <div className="countdown-progress">
                    <div 
                        className="progress-bar"
                        style={{ 
                            width: `${((initialValue - countdownValue) / initialValue) * 100}%` 
                        }}
                    />
                </div>

                <div className="countdown-footer">
                    <div className="ready-indicators">
                        <div className="indicator-text">
                            All players will start together
                        </div>
                        <div className="sync-icon">🎯</div>
                    </div>
                </div>

                {/* Background animation */}
                <div className="countdown-background">
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`bg-circle circle-${i + 1}`}
                            style={{
                                animationDelay: `${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

EnhancedCountdownScreen.propTypes = {
    initialValue: PropTypes.number,
    onCountdownComplete: PropTypes.func,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showTitle: PropTypes.bool
};

export default EnhancedCountdownScreen;
