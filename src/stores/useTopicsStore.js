import {create} from 'zustand';
import topicsApi from '../config/api/topics.api';

const useTopicsStore = create((set, get) => ({
    topics: [],
    loading: false,

    loadTopics: async () => {
        if (get().topics.length > 0) return; // Đã load rồi thì không load lại

        set({loading: true});

        try {
            const response = await topicsApi.getAllTopics();
            if (response?.status === 200 && response?.data && Array.isArray(response.data)) {
                const formattedTopics = response.data.map(topic => ({
                    id: topic.Id.toString(),
                    name: topic.Name
                }));
                set({topics: formattedTopics, loading: false});
            } else {
                set({topics: [], loading: false});
            }
        } catch (error) {
            set({topics: [], loading: false});
        }
    }
}));

export default useTopicsStore;
