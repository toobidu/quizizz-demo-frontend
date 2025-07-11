import { create } from 'zustand';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import socketService from '../services/socket';

const useUserStore = create((set, get) => ({
  // User data
  userName: localStorage.getItem('username') || 'User',
  
  // User stats
  stats: {
    highScore: 0,
    rank: 'N/A',
    fastestTime: 'N/A',
    bestTopic: 'N/A'
  },
  
  // Loading state
  loading: true,
  
  // Actions
  fetchUserProfile: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token in useUserStore:', token ? 'Token exists' : 'No token');
      
      if (token) {
        socketService.connect(token);
      } else {
        console.warn('No accessToken found in localStorage');
      }

      console.log('Fetching profile data...');
      const profileData = await profileApi.getMyProfile();
      console.log('Profile data received:', profileData);
      
      console.log('UserStore - Full profile data:', profileData);
      // API trả về Status 200 thay vì success
      if (profileData.Status === 200) {
        console.log('UserStore - Profile data details:', profileData.Data);
        set({
          userName: profileData.Data?.Username || 'User',
          stats: {
            highScore: profileData.Data?.HighestScore || 0,
            rank: profileData.Data?.HighestRank || 'N/A',
            fastestTime: profileData.Data?.FastestTime || 'N/A',
            bestTopic: profileData.Data?.BestTopic || 'N/A'
          },
          loading: false
        });
      } else {
        console.error('Profile data not successful:', profileData);
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
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
        highScore: 0,
        rank: 'N/A',
        fastestTime: 'N/A',
        bestTopic: 'N/A'
      }
    });
    navigate('/');
  }
}));

export default useUserStore;