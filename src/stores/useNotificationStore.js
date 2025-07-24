import {create} from 'zustand';

const useNotificationStore = create((set, get) => ({
    notifications: [],

    addNotification: (notification) => {
        const id = Date.now();
        const newNotification = {
            id, type: 'info', duration: 5000, ...notification
        };

        set(state => ({
            notifications: [...state.notifications, newNotification]
        }));

        // Auto remove after duration
        if (newNotification.duration > 0) {
            setTimeout(() => {
                get().removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    },

    removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),

    clearAll: () => set({notifications: []}),

    // Helper methods
    success: (message, options = {}) => get().addNotification({
        type: 'success', message, ...options
    }),

    error: (message, options = {}) => get().addNotification({
        type: 'error', message, duration: 0, // Don't auto-remove errors
        ...options
    }),

    warning: (message, options = {}) => get().addNotification({
        type: 'warning', message, ...options
    }),

    info: (message, options = {}) => get().addNotification({
        type: 'info', message, ...options
    })
}));

export default useNotificationStore;
