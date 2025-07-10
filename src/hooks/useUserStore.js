import { create } from 'zustand';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import socketService from '../services/socket';

const useUserStore = create((set, get) => ({
  // User data
  userName: localStorage.getItem('username') || 'User',
  
  // User stats
  stats: {
    gamesPlayed: 0,
    highScore: 0,
    rank: 'N/A',
    medals: 0
  },
  
  // Loading state
  loading: true,
  
  // Actions
  fetchUserProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
      }

      const profileData = await profileApi.getMyProfile();
      if (profileData.success) {
        set({
          stats: {
            gamesPlayed: profileData.data.gamesPlayed || 0,
            highScore: profileData.data.highScore || 0,
            rank: profileData.data.rank || 'N/A',
            medals: profileData.data.medals || 0
          },
          loading: false
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      set({ loading: false });
    }
  },
  
  logout: async (navigate) => {
    socketService.disconnect();
    await authApi.logout();
    localStorage.removeItem('username');
    set({ 
      userName: 'User',
      stats: {
        gamesPlayed: 0,
        highScore: 0,
        rank: 'N/A',
        medals: 0
      }
    });
    navigate('/');
  }
}));

export default useUserStore;