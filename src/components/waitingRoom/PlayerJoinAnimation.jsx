import React, { useState, useEffect } from 'react';
import './PlayerJoinAnimation.css';

const PlayerJoinAnimation = ({ playerId, playerName, type = 'join' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('enter');

  useEffect(() => {
    // Start exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setAnimationPhase('exit');
    }, 2500);

    // Remove component after exit animation
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  const animationClass = type === 'join' ? 'player-join-animation' : 'player-leave-animation';
  const emoji = type === 'join' ? '🎉' : '👋';
  const message = type === 'join' 
    ? `${playerName} đã tham gia!` 
    : `${playerName} đã rời phòng!`;

  return (
    <div className={`${animationClass} ${animationPhase}`}>
      <div className="animation-content">
        <span className="animation-emoji">{emoji}</span>
        <span className="animation-message">{message}</span>
      </div>
    </div>
  );
};

export default PlayerJoinAnimation;
