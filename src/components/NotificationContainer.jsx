import React from 'react';
import {FiAlertCircle, FiAlertTriangle, FiCheck, FiInfo, FiX} from 'react-icons/fi';
import useNotificationStore from '../stores/useNotificationStore';

const NotificationContainer = () => {
    const {notifications, removeNotification} = useNotificationStore();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FiCheck/>;
            case 'error':
                return <FiAlertCircle/>;
            case 'warning':
                return <FiAlertTriangle/>;
            default:
                return <FiInfo/>;
        }
    };

    if (notifications.length === 0) return null;

    return (<div className="notification-container">
        {notifications.map((notification) => (<div
            key={notification.id}
            className={`notification notification-${notification.type}`}
        >
            <div className="notification-icon">
                {getIcon(notification.type)}
            </div>
            <div className="notification-content">
                {notification.title && (<div className="notification-title">{notification.title}</div>)}
                <div className="notification-message">{notification.message}</div>
            </div>
            <button
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
            >
                <FiX/>
            </button>
        </div>))}
    </div>);
};

export default NotificationContainer;
