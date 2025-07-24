import {create} from 'zustand';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import unifiedWebSocketService from '../services/unifiedWebSocketService';

const useUserStore = create((set, get) => ({
    // User data
    userName: localStorage.getItem('username') || 'User',

    // User stats
    stats: {
        highScore: 0, rank: 'N/A', fastestTime: 'N/A', bestTopic: 'N/A'
    },

    // Loading state
    loading: true,

    // Actions
    fetchUserProfile: async () => {
        try {
            const token = localStorage.getItem('accessToken');

            if (!accessToken) {
                return;
            }

            const profileData = await profileApi.getMyProfile();

            // API có thể trả về Status 200 hoặc status 200
            if (profileData.status === 200 || profileData.status === 200) {
                const userData = profileData.data || profileData.data;
                set({
                    userName: userData?.username || userData?.username, 
                    stats: {
                        highScore: userData?.Stats?.TotalPoints || userData?.stats?.totalPoints,
                        rank: userData?.Stats?.Rank || userData?.stats?.rank,
                        fastestTime: userData?.Stats?.FastestTime || userData?.stats?.fastestTime,
                        bestTopic: userData?.Stats?.BestTopic || userData?.stats?.bestTopic
                    }, 
                    loading: false
                });
            } else {
                set({loading: false});
            }
        } catch (error) {
            set({loading: false});
        }
    },

    logout: async (navigate) => {
        unifiedWebSocketService.disconnect();
        await authApi.logout();
        localStorage.removeItem('username');
        set({
            userName: 'User', stats: {
                highScore: 0, rank: 'N/A', fastestTime: 'N/A', bestTopic: 'N/A'
            }
        });
        navigate('/');
    }
}));

export default useUserStore;
