import {create} from 'zustand';
// Notifications đã được chuyển sang useNotificationStore

const useUIStore = create((set, get) => ({
    // UI state
    darkMode: localStorage.getItem('darkMode') === 'true',
    isMenuOpen: false,
    isCreateRoomModalOpen: false,

    // UI actions
    toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        localStorage.setItem('darkMode', newDarkMode);
        set({darkMode: newDarkMode});
    },

    toggleMenu: () => set(state => ({isMenuOpen: !state.isMenuOpen})),

    closeMenu: () => set({isMenuOpen: false}),

    // Create Room Modal
    openCreateRoomModal: () => {
        set({isCreateRoomModalOpen: true});
    },
    closeCreateRoomModal: () => {
        set({isCreateRoomModalOpen: false});
    }
}));

export default useUIStore;
