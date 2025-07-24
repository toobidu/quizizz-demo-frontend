/**
 * Notification Utilities
 *
 * Các tiện ích để hiển thị thông báo trong ứng dụng
 */

// Mảng lưu trữ các thông báo gần đây
const recentNotifications = [];
const MAX_NOTIFICATIONS = 10;

/**
 * Hiển thị thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo (success, error, warning, info)
 */
export const showNotification = (message, type = 'info') => {
  // Tạo thông báo mới
  const notification = {
    id: Date.now(),
    message,
    type,
    timestamp: new Date().toISOString()
  };

  // Thêm vào đầu mảng
  recentNotifications.unshift(notification);

  // Giới hạn số lượng thông báo lưu trữ
  if (recentNotifications.length > MAX_NOTIFICATIONS) {
    recentNotifications.pop();
  }

  // Log ra console
  const styles = {
    success: 'color: #4caf50; font-weight: bold',
    error: 'color: #f44336; font-weight: bold',
    warning: 'color: #ff9800; font-weight: bold',
    info: 'color: #2196f3; font-weight: bold'
  };


  // Nếu có DOM, hiển thị thông báo
  if (typeof document !== 'undefined') {
    // Tạo element thông báo
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${type}`;
    notificationElement.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
      </div>
    `;

    // Thêm vào DOM
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    container.appendChild(notificationElement);

    // Hiệu ứng hiển thị
    setTimeout(() => {
      notificationElement.classList.add('show');
    }, 10);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      notificationElement.classList.remove('show');
      setTimeout(() => {
        notificationElement.remove();
      }, 300);
    }, 3000);
  }
};

/**
 * Tạo container cho thông báo
 * @returns {HTMLElement} Container element
 */
const createNotificationContainer = () => {
  const container = document.createElement('div');
  container.className = 'notification-container';
  document.body.appendChild(container);
  return container;
};

/**
 * Lấy danh sách các thông báo gần đây
 * @returns {Array} Danh sách thông báo
 */
export const getRecentNotifications = () => {
  return [...recentNotifications];
};

/**
 * Xóa tất cả thông báo
 */
export const clearNotifications = () => {
  recentNotifications.length = 0;
};

export default {
  showNotification,
  getRecentNotifications,
  clearNotifications
};
