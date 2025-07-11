import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // UI state
  darkMode: localStorage.getItem('darkMode') === 'true',
  notifications: [],
  isMenuOpen: false,
  isCreateRoomModalOpen: false,
  
  // UI actions
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    localStorage.setItem('darkMode', newDarkMode);
    set({ darkMode: newDarkMode });
  },
  
  addNotification: (notification) => set(state => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      ...notification
    }]
  })),
  
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),
  
  toggleMenu: () => set(state => ({ isMenuOpen: !state.isMenuOpen })),
  
  closeMenu: () => set({ isMenuOpen: false }),
  
  // Create Room Modal
  openCreateRoomModal: () => {
    console.log('Setting isCreateRoomModalOpen to true');
    set({ isCreateRoomModalOpen: true });
  },
  closeCreateRoomModal: () => {
    console.log('Setting isCreateRoomModalOpen to false');
    set({ isCreateRoomModalOpen: false });
  }
}));

export default useUIStore;