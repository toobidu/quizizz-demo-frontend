import { useEffect, useCallback, useRef, useState } from 'react';
import unifiedWebSocketService from '../services/unifiedWebSocketService';

/**
 * Unified WebSocket Hook - Replaces all existing WebSocket hooks
 * Provides stable connection management without re-renders
 */
export const useUnifiedWebSocket = (options = {}) => {
    const { 
        roomCode = null,
        autoConnect = true,
        autoJoin = true,
        onConnect = null,
        onDisconnect = null,
        onError = null 
    } = options;

    // Stable state
    const [connectionState, setConnectionState] = useState({
        isConnected: unifiedWebSocketService.isConnected,
        isConnecting: unifiedWebSocketService.isConnecting,
        error: null
    });

    // Stable refs for callbacks
    const callbacksRef = useRef({ onConnect, onDisconnect, onError });
    callbacksRef.current = { onConnect, onDisconnect, onError };

    // Track if we've connected to this room
    const hasConnectedRef = useRef(false);
    const hasJoinedRef = useRef(false);

    // Stable connect function
    const connect = useCallback(async () => {
        if (hasConnectedRef.current && unifiedWebSocketService.currentRoom === roomCode) {
            return;
        }

        try {
            setConnectionState(prev => ({ ...prev, error: null }));
            await unifiedWebSocketService.connect(roomCode);
            hasConnectedRef.current = true;
            // Auto-join room after connection
            if (autoJoin && roomCode && !hasJoinedRef.current) {
                unifiedWebSocketService.joinRoom(roomCode);
                hasJoinedRef.current = true;
            }
        } catch (error) {
            setConnectionState(prev => ({ ...prev, error }));
            if (callbacksRef.current.onError) {
                callbacksRef.current.onError(error);
            }
        }
    }, [roomCode, autoJoin]);

    // Stable disconnect function
    const disconnect = useCallback(() => {
        if (roomCode && unifiedWebSocketService.currentRoom === roomCode) {
            unifiedWebSocketService.leaveRoom();
        }
        hasConnectedRef.current = false;
        hasJoinedRef.current = false;
    }, [roomCode]);

    // Stable send function
    const send = useCallback((event, data) => {
        const result = unifiedWebSocketService.send(event, data);
        return result;
    }, []);

    // Stable sendSafely function
    const sendSafely = useCallback(async (event, data, timeout) => {
        try {
            const result = await unifiedWebSocketService.sendSafely(event, data, timeout);
            return result;
        } catch (error) {
            throw error;
        }
    }, []);

    // Update connection state when service state changes
    const updateConnectionState = useCallback(() => {
        const status = unifiedWebSocketService.getStatus();
        setConnectionState(prev => {
            const newState = {
                ...prev,
                isConnected: status.isConnected,
                isConnecting: status.isConnecting
            };
            return newState;
        });
    }, []);

    // Setup event listeners
    useEffect(() => {
        
        const handleConnect = (data) => {
            updateConnectionState();
            if (callbacksRef.current.onConnect) {
                callbacksRef.current.onConnect(data);
            }
        };

        const handleDisconnect = (data) => {
            updateConnectionState();
            hasJoinedRef.current = false;
            if (callbacksRef.current.onDisconnect) {
                callbacksRef.current.onDisconnect(data);
            }
        };

        const handleError = (error) => {
            setConnectionState(prev => ({ ...prev, error }));
            if (callbacksRef.current.onError) {
                callbacksRef.current.onError(error);
            }
        };

        unifiedWebSocketService.on('connected', handleConnect);
        unifiedWebSocketService.on('disconnected', handleDisconnect);
        unifiedWebSocketService.on('error', handleError);

        // Initial state sync
        updateConnectionState();

        return () => {
            unifiedWebSocketService.off('connected', handleConnect);
            unifiedWebSocketService.off('disconnected', handleDisconnect);
            unifiedWebSocketService.off('error', handleError);
        };
    }, [updateConnectionState]);

    // Auto connect when roomCode changes
    useEffect(() => {
        if (!roomCode || !autoConnect) {
            return;
        }

        // Reset connection state for new room
        if (unifiedWebSocketService.currentRoom !== roomCode) {
            hasConnectedRef.current = false;
            hasJoinedRef.current = false;
        }
        connect();

        // Cleanup only if switching to different room
        return () => {
            // Don't disconnect if we're just re-rendering the same room
            if (unifiedWebSocketService.currentRoom !== roomCode) {
                disconnect();
            } else {
            }
        };
    }, [roomCode, autoConnect, connect, disconnect]);

    return {
        isConnected: connectionState.isConnected,
        isConnecting: connectionState.isConnecting,
        error: connectionState.error,
        connect,
        disconnect,
        send,
        sendSafely,
        getStatus: unifiedWebSocketService.getStatus.bind(unifiedWebSocketService),
        hasConnected: hasConnectedRef.current,
        hasJoined: hasJoinedRef.current,
        currentRoom: unifiedWebSocketService.currentRoom
    };
};

/**
 * Hook for listening to specific WebSocket events
 * Prevents re-renders by using stable event listeners
 */
export const useWebSocketEvent = (eventName, callback, deps = []) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!eventName || typeof callbackRef.current !== 'function') {
            return;
        }

        const wrappedCallback = (data) => {
            try {
                callbackRef.current(data);
            } catch (error) {
            }
        };
        
        unifiedWebSocketService.on(eventName, wrappedCallback);
        return () => {
            unifiedWebSocketService.off(eventName, wrappedCallback);
        };
    }, [eventName, ...deps]);
};

/**
 * Hook for room-specific events
 * Only triggers callbacks for events from the current room
 */
export const useRoomEvents = (roomCode, handlers = {}) => {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!roomCode) {
            return;
        }

        const eventHandlers = new Map();

        // Create filtered handlers that only respond to current room
        Object.entries(handlersRef.current).forEach(([event, handler]) => {
            if (typeof handler !== 'function') {
                return;
            }

            const filteredHandler = (data) => {
                try {
                    // Only handle events for current room or global events
                    if (!data.roomCode || data.roomCode === roomCode) {
                        handler(data);
                    } else {
                    }
                } catch (error) {
                }
            };

            eventHandlers.set(event, filteredHandler);
            unifiedWebSocketService.on(event, filteredHandler);
        });

        // Cleanup
        return () => {
            eventHandlers.forEach((handler, event) => {
                unifiedWebSocketService.off(event, handler);
            });
        };
    }, [roomCode]);
};

/**
 * Hook for WebSocket connection status monitoring
 * Useful for debugging and displaying connection state
 */
export const useWebSocketStatus = () => {
    const [status, setStatus] = useState(() => unifiedWebSocketService.getStatus());

    useEffect(() => {
        
        const updateStatus = () => {
            const newStatus = unifiedWebSocketService.getStatus();
            setStatus(newStatus);
        };

        const handleConnect = () => {
            updateStatus();
        };
        
        const handleDisconnect = () => {
            updateStatus();
        };

        unifiedWebSocketService.on('connected', handleConnect);
        unifiedWebSocketService.on('disconnected', handleDisconnect);

        // Update status periodically for debugging
        const statusInterval = setInterval(() => {
            updateStatus();
        }, 5000);

        return () => {
            unifiedWebSocketService.off('connected', handleConnect);
            unifiedWebSocketService.off('disconnected', handleDisconnect);
            clearInterval(statusInterval);
        };
    }, []);

    return status;
};

export default useUnifiedWebSocket;
