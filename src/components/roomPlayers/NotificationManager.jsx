import {useState} from 'react';

// Custom hook for managing notifications
const useNotificationManager = () => {
    const [notifications, setNotifications] = useState([]);

    // Helper function to add notification
    const addNotification = (message, type = 'info') => {
        const notification = {
            id: Date.now(), message, type, timestamp: new Date()
        };

        setNotifications(prev => [...prev.slice(-4), notification]); // Keep max 5 notifications

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);

        return notification;
    };

    return {
        notifications, addNotification
    };
};

export default useNotificationManager;
