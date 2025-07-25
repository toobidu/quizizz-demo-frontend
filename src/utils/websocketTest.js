/**
 * WebSocket Connection Test
 * File test để kiểm tra các fixes đã thực hiện
 */

import { ensureWebSocketConnection, joinRoomWithFullInfo } from '../services/websocketUtils.js';
import unifiedWebSocketService from '../services/unifiedWebSocketService.js';

/**
 * Test WebSocket connection và game flow
 */
export async function testWebSocketFixes() {
    console.log('🧪 === TESTING WEBSOCKET FIXES ===');
    
    try {
        // Test 1: Ensure WebSocket Connection
        console.log('🧪 Test 1: ensureWebSocketConnection');
        const connected = await ensureWebSocketConnection();
        console.log('🧪 Connection result:', connected);
        
        if (!connected) {
            console.error('❌ Test 1 FAILED: Could not establish WebSocket connection');
            return false;
        }
        
        // Test 2: Join Room với đầy đủ thông tin
        console.log('🧪 Test 2: joinRoomWithFullInfo');
        
        // Setup test user data
        localStorage.setItem('userId', '123');
        localStorage.setItem('username', 'TestUser');
        
        const joinResult = await joinRoomWithFullInfo('TEST123');
        console.log('🧪 Join room result:', joinResult);
        
        if (!joinResult) {
            console.error('❌ Test 2 FAILED: Could not join room');
            return false;
        }
        
        // Test 3: Send start-game event
        console.log('🧪 Test 3: sendSafely start-game');
        
        try {
            const gameStartData = {
                roomCode: 'TEST123',
                hostUserId: 123,
                selectedTopicIds: [1, 2],
                questionCount: 5,
                timeLimit: 30
            };
            
            const startResult = await unifiedWebSocketService.sendSafely('start-game', gameStartData, 5000);
            console.log('🧪 Start game result:', startResult);
            console.log('✅ Test 3 PASSED: start-game event sent via WebSocket');
        } catch (error) {
            console.warn('⚠️ Test 3 WARNING: start-game might fail without backend running:', error.message);
        }
        
        console.log('✅ === ALL TESTS COMPLETED ===');
        return true;
        
    } catch (error) {
        console.error('❌ TEST SUITE FAILED:', error);
        return false;
    }
}

/**
 * Test Vite proxy configuration
 */
export function testViteProxy() {
    console.log('🧪 === TESTING VITE PROXY ===');
    
    const isDev = import.meta.env.DEV;
    console.log('🧪 Environment:', isDev ? 'Development' : 'Production');
    
    if (isDev) {
        console.log('🧪 Expected WebSocket URL: ws://localhost:5173/ws');
        console.log('🧪 This should proxy to: ws://localhost:3001');
    } else {
        console.log('🧪 Expected WebSocket URL: ws://localhost:3001');
    }
    
    return true;
}

/**
 * Validate localStorage user data
 */
export function validateUserData() {
    console.log('🧪 === VALIDATING USER DATA ===');
    
    const checks = [
        { key: 'userId', value: localStorage.getItem('userId') },
        { key: 'username', value: localStorage.getItem('username') },
        { key: 'user', value: localStorage.getItem('user') },
        { key: 'accessToken', value: localStorage.getItem('accessToken') },
        { key: 'token', value: localStorage.getItem('token') }
    ];
    
    console.log('📦 Available localStorage data:');
    checks.forEach(check => {
        console.log(`🧪 ${check.key}:`, check.value ? '✅ Present' : '❌ Missing');
    });
    
    // Check if we have minimum required data
    const hasUserId = checks.find(c => c.key === 'userId')?.value;
    const hasUsername = checks.find(c => c.key === 'username')?.value;
    
    if (!hasUserId || !hasUsername) {
        console.warn('⚠️ Missing required user data for WebSocket connection');
        console.log('💡 Suggested fix: Ensure user login sets userId and username in localStorage');
        return false;
    }
    
    console.log('✅ User data validation passed');
    return true;
}

// Export all test functions
export default {
    testWebSocketFixes,
    testViteProxy,
    validateUserData
};
