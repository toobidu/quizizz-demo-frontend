/**
 * Username Test Utility
 * Use this to test username functionality in browser console
 */

// Test 1: Test username utility functions
console.log('🧪 [USERNAME_TEST] === TESTING USERNAME UTILITIES ===');

import { getUsername, ensureUsername, setUsername } from '../utils/usernameUtils.js';

// Test setting username
console.log('🧪 [USERNAME_TEST] Testing setUsername...');
const testResult = setUsername('TestUser123');
console.log('🧪 [USERNAME_TEST] setUsername result:', testResult);

// Test getting username
console.log('🧪 [USERNAME_TEST] Testing getUsername...');
const username1 = getUsername();
console.log('🧪 [USERNAME_TEST] getUsername result:', username1);

// Test ensure username
console.log('🧪 [USERNAME_TEST] Testing ensureUsername...');
const username2 = ensureUsername();
console.log('🧪 [USERNAME_TEST] ensureUsername result:', username2);

// Test edge cases
console.log('🧪 [USERNAME_TEST] Testing edge cases...');

// Clear username and test fallback
localStorage.removeItem('username');
const username3 = ensureUsername();
console.log('🧪 [USERNAME_TEST] ensureUsername with no localStorage:', username3);

// Test with invalid username
const invalidResult = setUsername('');
console.log('🧪 [USERNAME_TEST] setUsername with empty string:', invalidResult);

const invalidResult2 = setUsername(null);
console.log('🧪 [USERNAME_TEST] setUsername with null:', invalidResult2);

console.log('🧪 [USERNAME_TEST] === ALL TESTS COMPLETED ===');
console.log('🧪 [USERNAME_TEST] Final localStorage username:', localStorage.getItem('username'));

// Test WebSocket username sending
console.log('🧪 [USERNAME_TEST] === TESTING WEBSOCKET USERNAME ===');

// Simulate join-room event
const mockRoomCode = 'TEST123';
const mockUserId = '12345';
const finalUsername = ensureUsername();

console.log('🧪 [USERNAME_TEST] Mock join-room data:');
console.log('🧪 [USERNAME_TEST] - roomCode:', mockRoomCode);
console.log('🧪 [USERNAME_TEST] - userId:', mockUserId);
console.log('🧪 [USERNAME_TEST] - username:', finalUsername);

const joinData = {
    roomCode: mockRoomCode,
    userId: mockUserId,
    username: finalUsername
};

console.log('🧪 [USERNAME_TEST] Final join-room payload:', joinData);
console.log('🧪 [USERNAME_TEST] Username is valid:', Boolean(joinData.username && joinData.username.trim()));

export { joinData };
