import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Store for managing real-time UI state and animations
 */
const useRealtimeUIStore = create(
  devtools(
    (set, get) => ({
      // Animation state
      activeAnimations: [],
      playerAnimations: new Map(), // playerId -> animation info
      
      // Real-time notifications
      realtimeNotifications: [],
      
      // Connection status for UI
      connectionState: {
        isConnected: false,
        isConnecting: false,
        lastHeartbeat: null,
        reconnectAttempts: 0
      },

      // Player status tracking
      playerStatusMap: new Map(), // playerId -> { isNew, joinedAt, status }

      // Actions
      addPlayerAnimation: (playerId, playerName, type = 'join') => {
        const animationId = `${type}-${playerId}-${Date.now()}`;
        const animation = {
          id: animationId,
          playerId,
          playerName,
          type,
          timestamp: Date.now()
        };

        set((state) => ({
          activeAnimations: [...state.activeAnimations, animation],
          playerAnimations: new Map(state.playerAnimations.set(playerId, animation))
        }));

        // Auto-remove after 3 seconds
        setTimeout(() => {
          get().removePlayerAnimation(animationId);
        }, 3000);

        return animationId;
      },

      removePlayerAnimation: (animationId) => {
        set((state) => {
          const newAnimations = state.activeAnimations.filter(anim => anim.id !== animationId);
          const newPlayerAnimations = new Map(state.playerAnimations);
          
          // Remove from playerAnimations map
          for (const [playerId, animation] of newPlayerAnimations.entries()) {
            if (animation.id === animationId) {
              newPlayerAnimations.delete(playerId);
              break;
            }
          }

          return {
            activeAnimations: newAnimations,
            playerAnimations: newPlayerAnimations
          };
        });
      },

      markPlayerAsNew: (playerId, playerName) => {
        set((state) => {
          const newStatusMap = new Map(state.playerStatusMap);
          newStatusMap.set(playerId, {
            isNew: true,
            joinedAt: Date.now(),
            playerName,
            status: 'joined'
          });

          return { playerStatusMap: newStatusMap };
        });

        // Remove "new" status after 5 seconds
        setTimeout(() => {
          get().unmarkPlayerAsNew(playerId);
        }, 5000);
      },

      unmarkPlayerAsNew: (playerId) => {
        set((state) => {
          const newStatusMap = new Map(state.playerStatusMap);
          const currentStatus = newStatusMap.get(playerId);
          
          if (currentStatus) {
            newStatusMap.set(playerId, {
              ...currentStatus,
              isNew: false
            });
          }

          return { playerStatusMap: newStatusMap };
        });
      },

      isPlayerNew: (playerId) => {
        const status = get().playerStatusMap.get(playerId);
        return status?.isNew || false;
      },

      addRealtimeNotification: (message, type = 'info', duration = 3000) => {
        const notificationId = `notification-${Date.now()}`;
        const notification = {
          id: notificationId,
          message,
          type,
          timestamp: Date.now()
        };

        set((state) => ({
          realtimeNotifications: [...state.realtimeNotifications, notification]
        }));

        // Auto-remove
        setTimeout(() => {
          get().removeRealtimeNotification(notificationId);
        }, duration);

        return notificationId;
      },

      removeRealtimeNotification: (notificationId) => {
        set((state) => ({
          realtimeNotifications: state.realtimeNotifications.filter(
            notif => notif.id !== notificationId
          )
        }));
      },

      updateConnectionState: (updates) => {
        set((state) => ({
          connectionState: {
            ...state.connectionState,
            ...updates,
            lastHeartbeat: updates.lastHeartbeat || state.connectionState.lastHeartbeat
          }
        }));
      },

      // Bulk actions for better performance
      handlePlayerJoinedRealtime: (playerId, playerName) => {
        const state = get();
        
        // Add animation
        state.addPlayerAnimation(playerId, playerName, 'join');
        
        // Mark as new
        state.markPlayerAsNew(playerId, playerName);
        
        // Add notification
        state.addRealtimeNotification(`🎉 ${playerName} đã tham gia phòng!`, 'success');
      },

      handlePlayerLeftRealtime: (playerId, playerName) => {
        const state = get();
        
        // Add animation
        state.addPlayerAnimation(playerId, playerName, 'leave');
        
        // Remove from status map
        set((currentState) => {
          const newStatusMap = new Map(currentState.playerStatusMap);
          newStatusMap.delete(playerId);
          return { playerStatusMap: newStatusMap };
        });
        
        // Add notification
        state.addRealtimeNotification(`👋 ${playerName} đã rời phòng!`, 'warning');
      },

      // Cleanup actions
      clearAllAnimations: () => {
        set({
          activeAnimations: [],
          playerAnimations: new Map()
        });
      },

      clearPlayerStatus: () => {
        set({
          playerStatusMap: new Map()
        });
      },

      reset: () => {
        set({
          activeAnimations: [],
          playerAnimations: new Map(),
          realtimeNotifications: [],
          playerStatusMap: new Map(),
          connectionState: {
            isConnected: false,
            isConnecting: false,
            lastHeartbeat: null,
            reconnectAttempts: 0
          }
        });
      }
    }),
    {
      name: 'realtime-ui-store',
      partialize: (state) => ({
        // Don't persist animations or real-time state
        connectionState: state.connectionState
      })
    }
  )
);

export default useRealtimeUIStore;
