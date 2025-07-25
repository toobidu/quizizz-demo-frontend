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
        if (!this.events[event]) {
            return this;
        }
        this.events[event].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                // Silently ignore listener errors
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
