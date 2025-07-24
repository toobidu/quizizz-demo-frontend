import {create} from 'zustand';
import roomState from './roomState';
import roomPlayers from './roomPlayers';
import roomWebSocket from './roomWebSocket';
import roomUtils from './roomUtils';

const useRoomStore = create((set, get) => ({
    // Combine all modules
    ...roomState(set, get), ...roomPlayers(set, get), ...roomWebSocket(set, get), ...roomUtils(set, get)
}));

export default useRoomStore;
