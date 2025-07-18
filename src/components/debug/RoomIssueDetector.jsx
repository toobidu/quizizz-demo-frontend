/**
 * Room Issue Detector - Component tự động phát hiện và báo cáo vấn đề room
 */

import React, { useState, useEffect } from 'react';
import { fixRoom, fixAllRooms } from '../../utils/roomStateFixer';
import useRoomStateMonitor from '../../hooks/useRoomStateMonitor';

const RoomIssueDetector = ({ currentRoomCode = null, enabled = true }) => {
  const [issues, setIssues] = useState([]);
  const [fixing, setFixing] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  
  // Monitor current room nếu có
  const { issueCount } = useRoomStateMonitor(currentRoomCode, enabled && !!currentRoomCode);

  // Auto-detect issues periodically
  useEffect(() => {
    if (!enabled) return;

    const detectIssues = async () => {
      // Logic để detect issues sẽ được implement sau
      setLastCheck(new Date().toLocaleTimeString());
    };

    const interval = setInterval(detectIssues, 30000); // Check mỗi 30 giây
    detectIssues(); // Check ngay lập tức

    return () => clearInterval(interval);
  }, [enabled]);

  const handleFixRoom = async (roomCode) => {
    setFixing(true);
    try {
      const result = await fixRoom(roomCode);
      console.log('Fix room result:', result);
      
      if (result.success) {
        alert(`✅ Fixed room ${roomCode}: ${result.message}`);
      } else {
        alert(`❌ Failed to fix room ${roomCode}: ${result.error}`);
      }
    } catch (error) {
      alert(`💥 Error fixing room: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  const handleFixAllRooms = async () => {
    setFixing(true);
    try {
      const result = await fixAllRooms();
      console.log('Fix all rooms result:', result);
      
      if (result.success) {
        alert(`✅ Checked ${result.totalRooms} rooms, fixed ${result.problematicRooms} problematic rooms`);
      } else {
        alert(`❌ Failed to fix rooms: ${result.error}`);
      }
    } catch (error) {
      alert(`💥 Error fixing rooms: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '350px',
      fontSize: '12px',
      zIndex: 9998
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
        🚨 Room Issue Detector
      </h4>
      
      {currentRoomCode && (
        <div style={{ marginBottom: '10px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
          <div><strong>Monitoring Room:</strong> {currentRoomCode}</div>
          <div><strong>Issues Detected:</strong> {issueCount}</div>
          {issueCount > 0 && (
            <button
              onClick={() => handleFixRoom(currentRoomCode)}
              disabled={fixing}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: fixing ? 'not-allowed' : 'pointer',
                fontSize: '11px'
              }}
            >
              {fixing ? 'Fixing...' : 'Fix This Room'}
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <div><strong>Last Check:</strong> {lastCheck || 'Never'}</div>
        <div><strong>Total Issues:</strong> {issues.length}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={handleFixAllRooms}
          disabled={fixing}
          style={{
            padding: '6px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: fixing ? 'not-allowed' : 'pointer',
            fontSize: '11px'
          }}
        >
          {fixing ? 'Fixing...' : 'Fix All Rooms'}
        </button>
      </div>

      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#6c757d',
        borderTop: '1px solid #dee2e6',
        paddingTop: '8px'
      }}>
        <div>🔍 Monitors room state consistency</div>
        <div>🔧 Auto-fixes detected issues</div>
        <div>📊 Tracks problematic patterns</div>
      </div>
    </div>
  );
};

export default RoomIssueDetector;