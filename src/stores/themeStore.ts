import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
    floorColor: string;
    setFloorColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            floorColor: "#08632C", // Verde feltro padrão
            setFloorColor: (color) => set({ floorColor: color }),
        }),
        {
            name: "dice-roller-theme-settings",
        }
    )
);
