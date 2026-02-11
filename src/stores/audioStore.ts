import { create } from 'zustand';

interface AudioState {
  playSfx: (src: string) => void;
}

export const useAudioStore = create<AudioState>(() => ({
  playSfx: (src: string) => {
    try {
      const audio = new Audio(src);
      audio.volume = 0.5; // Set a reasonable volume
      audio.play().catch(e => console.error("Audio Playback Error:", e));
    } catch (e) {
      console.error("Audio Creation Error:", e);
    }
  },
}));
