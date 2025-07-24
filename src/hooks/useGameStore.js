import {create} from 'zustand';

const useGameStore = create((set, get) => ({
    // Game state
    currentGame: null, gameHistory: [], gameSettings: {
        difficulty: 'medium', timeLimit: 60, sound: true
    },

    // Game actions
    setCurrentGame: (game) => set({currentGame: game}),

    updateGameSettings: (settings) => set({
        gameSettings: {...get().gameSettings, ...settings}
    }),

    addGameToHistory: (gameResult) => set({
        gameHistory: [...get().gameHistory, {...gameResult, date: new Date()}]
    }),

    clearGameHistory: () => set({gameHistory: []})
}));

export default useGameStore;
