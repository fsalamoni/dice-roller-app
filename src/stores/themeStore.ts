import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    floorColor: string;
    setFloorColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            floorColor: '#006400', // Default dark green felt
            setFloorColor: (color) => set({ floorColor: color }),
        }),
        {
            name: 'dice-roller-theme-settings',
        }
    )
);
