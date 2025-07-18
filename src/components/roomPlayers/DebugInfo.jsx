import React from 'react';

const DebugInfo = ({ roomCode, playersCount, hostUsername, lastUpdate }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="debug-info">
      <details>
        <summary>🔍 Debug Info</summary>
        <pre>{JSON.stringify({
          roomCode,
          playersCount,
          host: hostUsername,
          lastUpdate: lastUpdate?.toISOString()
        }, null, 2)}</pre>
      </details>
    </div>
  );
};

export default DebugInfo;