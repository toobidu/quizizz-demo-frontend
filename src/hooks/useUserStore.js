import {create} from 'zustand';
import profileApi from '../config/api/profile.api';
import authApi from '../config/api/auth.api';
import websocketService from '../services/websocketService';

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
                    userName: userData?.username || userData?.username || 'User', stats: {
                        highScore: userData?.Stats?.TotalPoints || userData?.stats?.totalPoints || 0,
                        rank: userData?.Stats?.Rank || userData?.stats?.rank || 'N/A',
                        fastestTime: userData?.Stats?.FastestTime || userData?.stats?.fastestTime || 'N/A',
                        bestTopic: userData?.Stats?.BestTopic || userData?.stats?.bestTopic || 'N/A'
                    }, loading: false
                });
            } else {
                set({loading: false});
            }
        } catch (error) {
            set({loading: false});
        }
    },

    logout: async (navigate) => {
        websocketService.disconnect();
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
