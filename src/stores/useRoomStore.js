import useRoomStore from './roomStore';
// Add cleanupWebSocketListeners function for backward compatibility
const originalStore = useRoomStore;

// Create a wrapper that adds the missing function
const wrappedStore = () => {
    const store = originalStore();
    // If cleanupWebSocketListeners is missing, add it
    if (!store.cleanupWebSocketListeners) {
        store.cleanupWebSocketListeners = () => {
            // This function should call disconnectWebSocket which already exists
            if (store.disconnectWebSocket) {
                store.disconnectWebSocket();
            } else {
            }
        };
    }

    return store;
};

export default wrappedStore;
