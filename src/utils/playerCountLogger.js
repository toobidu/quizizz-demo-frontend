/**
 * Player Count Logger
 * 
 * Utility to log and track player count changes in rooms
 */

const playerCountLogger = {
  /**
   * Log player count changes
   * @param {string} roomCode - Room code
   * @param {number} count - Current player count
   * @param {string} event - Event type (join, leave, update)
   */
  logPlayerCount: (roomCode, count, event = 'update') => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const timestamp = new Date().toISOString();
    const eventEmoji = event === 'join' ? '➕' : event === 'leave' ? '➖' : '🔄';
    
    console.log(`${eventEmoji} [${timestamp}] Room ${roomCode}: ${count} players (${event})`);
  }
};

export default playerCountLogger;