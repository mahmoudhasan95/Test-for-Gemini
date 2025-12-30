import { createContext, useContext, useRef, ReactNode } from 'react';

interface AudioPlayerContextType {
  registerPlayer: (id: string, player: any) => void;
  unregisterPlayer: (id: string) => void;
  notifyPlaying: (id: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const playersRef = useRef<Map<string, any>>(new Map());
  const currentPlayingRef = useRef<string | null>(null);

  const registerPlayer = (id: string, player: any) => {
    playersRef.current.set(id, player);
  };

  const unregisterPlayer = (id: string) => {
    playersRef.current.delete(id);
    if (currentPlayingRef.current === id) {
      currentPlayingRef.current = null;
    }
  };

  const notifyPlaying = (id: string) => {
    playersRef.current.forEach((player, playerId) => {
      if (playerId !== id) {
        try {
          if (typeof player.isPlaying === 'function' && player.isPlaying()) {
            player.pause();
          } else if (typeof player.pause === 'function') {
            player.pause();
          }
          if (typeof player.reset === 'function') {
            player.reset();
          }
        } catch (error) {
          console.error('Error pausing player:', playerId, error);
        }
      }
    });
    currentPlayingRef.current = id;
  };

  return (
    <AudioPlayerContext.Provider value={{ registerPlayer, unregisterPlayer, notifyPlaying }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}
