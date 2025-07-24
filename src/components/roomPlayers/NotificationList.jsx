import React from 'react';

const NotificationList = ({notifications}) => {
    if (notifications.length === 0) return null;

    return (<div className="notifications">
        {notifications.map(notification => (<div
            key={notification.id}
            className={`notification ${notification.type}`}
        >
            <span>{notification.message}</span>
            <small>{notification.timestamp.toLocaleTimeString()}</small>
        </div>))}
    </div>);
};

export default NotificationList;
