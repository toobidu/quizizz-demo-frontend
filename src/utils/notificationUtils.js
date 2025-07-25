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
export const showNotification = () => {};

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
