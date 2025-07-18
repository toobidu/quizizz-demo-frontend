import { create } from 'zustand';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import websocketService from '../services/websocketService';

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
        websocketService.connect();
      } else {
        console.warn('No accessToken found in localStorage');
      }

      console.log('Fetching profile data...');
      const profileData = await profileApi.getMyProfile();
      console.log('Profile data received:', profileData);
      
      console.log('UserStore - Full profile data:', profileData);
      // API có thể trả về Status 200 hoặc status 200
      if (profileData.Status === 200 || profileData.status === 200) {
        const userData = profileData.Data || profileData.data;
        console.log('UserStore - Profile data details:', userData);
        set({
          userName: userData?.Username || userData?.username || 'User',
          stats: {
            highScore: userData?.Stats?.TotalPoints || userData?.stats?.totalPoints || 0,
            rank: userData?.Stats?.Rank || userData?.stats?.rank || 'N/A',
            fastestTime: userData?.Stats?.FastestTime || userData?.stats?.fastestTime || 'N/A',
            bestTopic: userData?.Stats?.BestTopic || userData?.stats?.bestTopic || 'N/A'
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
    websocketService.disconnect();
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