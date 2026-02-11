import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simplified types from the original project
export interface UserDiceSettings {
    skinId?: string;
    enable3D?: boolean;
    enableSfx?: boolean;
    enableShake?: boolean;
}

export const DICE_SKINS = [
    // 10 DIVINE TEXTURED SKINS
    { id: 'blood_ruby', name: 'Rubi Sangrento', hexColor: '#8B0000', text: '#FFFFFF' },
    { id: 'royal_sapphire', name: 'Safira Real', hexColor: '#00008B', text: '#FFD700' },
    { id: 'ancient_emerald', name: 'Esmeralda Antiga', hexColor: '#006400', text: '#FFFFFF' },
    { id: 'mystic_amethyst', name: 'Ametista Mística', hexColor: '#4B0082', text: '#00FFFF' },
    { id: 'celestial_gold', name: 'Ouro Celestial', hexColor: '#DAA520', text: '#000000' },
    { id: 'eternal_ice', name: 'Gelo Eterno', hexColor: '#0ea5e9', text: '#000033' },
    { id: 'cosmic_nebula', name: 'Nebulosa Cósmica', hexColor: '#7c3aed', text: '#34d399' },
    { id: 'pure_void', name: 'Void Profundo', hexColor: '#050505', text: '#FF0000' },
    { id: 'obsidian_night', name: 'Obsidiana Noturna', hexColor: '#111827', text: '#22d3ee' },
    { id: 'holy_pearl', name: 'Pérola Santa', hexColor: '#F0EAD6', text: '#8B0000' },
    // 5 SOLID COLOR SKINS
    { id: 'default', name: 'Índigo Original', hexColor: '#4f46e5', text: '#ffffff' },
    { id: 'crimson', name: 'Carmesim', hexColor: '#dc2626', text: '#ffffff' },
    { id: 'forest', name: 'Floresta', hexColor: '#16a34a', text: '#ffffff' },
    { id: 'ocean', name: 'Oceano', hexColor: '#0284c7', text: '#ffffff' },
    { id: 'midnight', name: 'Meia-Noite', hexColor: '#1e1b4b', text: '#a5b4fc' },
    // 5 GRADIENT/NEON SKINS
    { id: 'neon_pink', name: 'Neon Rosa', hexColor: '#db2777', text: '#ffffff' },
    { id: 'neon_cyan', name: 'Neon Ciano', hexColor: '#06b6d4', text: '#000000' },
    { id: 'sunset', name: 'Pôr do Sol', hexColor: '#f97316', text: '#000000' },
    { id: 'aurora', name: 'Aurora Boreal', hexColor: '#10b981', text: '#ffffff' },
    { id: 'shadow', name: 'Sombra', hexColor: '#374151', text: '#f9fafb' },
];

interface UserState {
    // We only need diceSettings for this store
    diceSettings: UserDiceSettings;
    updateDiceSkin: (skinId: string) => void;
    updateDiceSettings: (settings: Partial<UserDiceSettings>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            diceSettings: {
                skinId: 'default',
                enable3D: true,
                enableSfx: true,
                enableShake: true,
            },
            updateDiceSkin: (skinId) => {
                set((state) => ({
                    diceSettings: { ...state.diceSettings, skinId },
                }));
            },
            updateDiceSettings: (settings) => {
                set((state) => ({
                    diceSettings: { ...state.diceSettings, ...settings },
                }));
            },
        }),
        {
            name: 'dice-roller-user-settings', // name of the item in the storage (must be unique)
        }
    )
);
