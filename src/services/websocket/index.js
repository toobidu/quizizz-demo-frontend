/**
 * WebSocket Service - Entry Point
 *
 * Exports the singleton instance of WebSocketService
 */

import WebSocketService from './WebSocketService';

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;
