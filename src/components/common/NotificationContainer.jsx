import {useEffect} from 'react';

/**
 * Component hiển thị container cho thông báo
 */
const NotificationContainer = () => {
    useEffect(() => {
        // Tạo container nếu chưa có
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Dọn dẹp khi component unmount
        return () => {
            const container = document.querySelector('.notification-container');
            if (container) {
                container.remove();
            }
        };
    }, []);

    // Component này không render gì cả, chỉ tạo container
    return null;
};

export default NotificationContainer;
