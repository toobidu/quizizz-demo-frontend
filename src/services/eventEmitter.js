/**
 * Simple Event Emitter for WebSocket events
 *
 * Giúp các components có thể lắng nghe và phát sự kiện WebSocket
 * mà không cần trực tiếp phụ thuộc vào WebSocketService
 */

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return this;
    }

    off(event, callback) {
        if (!this.events[event]) return this;

        if (!callback) {
            delete this.events[event];
            return this;
        }

        this.events[event] = this.events[event].filter(cb => cb !== callback);
        return this;
    }

    emit(event, data) {
        console.log('📡 [EVENT_EMITTER] === EMITTING EVENT ===');
        console.log('📡 [EVENT_EMITTER] Event:', event);
        console.log('📡 [EVENT_EMITTER] Data:', data);
        console.log('📡 [EVENT_EMITTER] Timestamp:', new Date().toISOString());
        console.log('📡 [EVENT_EMITTER] Listeners count:', this.events[event]?.length || 0);
        
        if (!this.events[event]) {
            console.log('📡 [EVENT_EMITTER] ⚠️ No listeners for event:', event);
            return this;
        }

        this.events[event].forEach((callback, index) => {
            try {
                console.log('📡 [EVENT_EMITTER] 🔄 Calling listener', index + 1, 'for event:', event);
                callback(data);
                console.log('📡 [EVENT_EMITTER] ✅ Listener', index + 1, 'executed successfully');
            } catch (error) {
                console.log('📡 [EVENT_EMITTER] ❌ Error in listener', index + 1, 'for event:', event, error);
            }
        });
        return this;
    }

    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        return this.on(event, onceCallback);
    }
}

// Singleton instance
const eventEmitter = new EventEmitter();
export default eventEmitter;
