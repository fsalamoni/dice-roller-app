import { create } from 'zustand';
import { useAudioStore } from './audioStore';
import { useUserStore, DICE_SKINS } from './userStore';
import { SystemType, RollResult, VisibilityMode } from '../types';

// Define RollOutcome locally as it was removed from types.ts
type RollOutcome = 'NEUTRAL' | 'CRITICAL_SUCCESS' | 'CRITICAL_FAILURE';

interface DieRoll {
    id: string;
    dieType: number;
    result: number;
    xOffset: number;
    yOffset: number;
    delay: number;
    isFudge?: boolean;
    skin?: { id: string; name: string; bg: string; text: string };
}

interface DiceState {
    isRolling: boolean;
    rollingContext: string | null;
    lastResults: RollResult[];
    lastResult: RollResult | null;
    active3DRolls: DieRoll[];
    pendingRollRequest: {
        id: string;
        formula: string;
        faces: number;
        qty: number;
        mod: number;
        isFudge: boolean;
        authorName: string;
        label: string;
        visibility: VisibilityMode;
        skinColor: string;
        theme: string;
        textColor: string;
    } | null;
    performSystemRoll: (system: SystemType, formula: string, label: string, authorName: string) => void;
    finalizeDiceRoll: (physicsResults: number[]) => void;
}

// Keep the helper function to parse simple formulas
const parseSimpleFormula = (formula: string) => {
    const regexFudge = /^(\d*)dF\s*([+-]?\s*\d+)?$/i;
    const matchFudge = formula.replace(/\s/g, '').match(regexFudge);
    const regex = /^(\d*)d(\d+)\s*([+-]?\s*\d+)?$/i;
    const match = formula.replace(/\s/g, '').match(regex);

    let qty = 1, faces = 20, mod = 0, isFudge = false;

    if (matchFudge) {
        qty = matchFudge[1] ? parseInt(matchFudge[1]) : 4;
        faces = 6;
        mod = matchFudge[2] ? parseInt(matchFudge[2]) : 0;
        isFudge = true;
    } else if (match) {
        qty = match[1] ? parseInt(match[1]) : 1;
        faces = parseInt(match[2]);
        mod = match[3] ? parseInt(match[3]) : 0;
    }
    return { qty, faces, mod, isFudge };
}


export const useDiceStore = create<DiceState>((set, get) => ({
    isRolling: false,
    rollingContext: null,
    lastResults: [],
    lastResult: null,
    active3DRolls: [],
    pendingRollRequest: null,

    performSystemRoll: (system, formula, label, authorName) => {
        const { diceSettings } = useUserStore.getState();
        const visibility: VisibilityMode = 'PUBLIC';
        const currentSkinId = diceSettings?.skinId || 'default';
        const currentSkin = DICE_SKINS.find(s => s.id === currentSkinId);
        const skinColor = currentSkin?.hexColor || '#4f46e5';
        const textColor = currentSkin?.text || '#ffffff';

        const { qty, faces, mod, isFudge } = parseSimpleFormula(formula);

        if (qty > 20) return; // Cap at 20 dice

        const SKIN_TO_THEME: Record<string, string> = {
            'blood_ruby': 'divine_blood', 'royal_sapphire': 'divine_sapphire', 'ancient_emerald': 'divine_emerald',
            'mystic_amethyst': 'divine_amethyst', 'celestial_gold': 'divine_gold', 'eternal_ice': 'divine_ice',
            'cosmic_nebula': 'divine_nebula', 'pure_void': 'divine_void', 'obsidian_night': 'divine_obsidian',
            'holy_pearl': 'divine_pearl', 'default': 'default', 'crimson': 'default', 'forest': 'default',
            'ocean': 'default', 'midnight': 'default', 'neon_pink': 'default', 'neon_cyan': 'default',
            'sunset': 'default', 'aurora': 'default', 'shadow': 'default'
        };
        const theme = currentSkin?.id ? (SKIN_TO_THEME[currentSkin.id] || 'default') : 'default';
        const finalSkinColor = (theme.startsWith('divine_') && !isFudge) ? '#ffffff' : skinColor;

        set({
            isRolling: true,
            rollingContext: label,
            active3DRolls: [],
            pendingRollRequest: {
                id: `roll-${Date.now()}`,
                formula, faces, qty, mod, isFudge, authorName, label, visibility,
                skinColor: finalSkinColor, textColor, theme,
            }
        });

        if (diceSettings?.enableSfx !== false) {
            useAudioStore.getState().playSfx('/assets/dice-box/sounds/dice-throw-1.mp3');
        }
    },

    finalizeDiceRoll: (physicsResults: number[]) => {
        const { pendingRollRequest } = get();
        if (!pendingRollRequest) return;

        const { formula, faces, mod, isFudge, authorName, label, visibility } = pendingRollRequest;
        const { diceSettings } = useUserStore.getState();

        let totalSum = 0;
        const rolls: DieRoll[] = [];
        const fudgeSymbols: string[] = [];
        const rollValues: number[] = [];

        physicsResults.forEach((val, i) => {
            let resultVal = val;
            if (isFudge) {
                if (val <= 2) { resultVal = -1; fudgeSymbols.push('(-)'); }
                else if (val <= 4) { resultVal = 0; fudgeSymbols.push('( )'); }
                else { resultVal = 1; fudgeSymbols.push('(+)'); }
            } else {
                rollValues.push(val);
            }
            totalSum += resultVal;
            rolls.push({
                id: `die-${Date.now()}-${i}`, dieType: faces, result: val, isFudge,
                xOffset: 0, yOffset: 0, delay: 0
            });
        });

        const finalTotal = totalSum + mod;
        let outcome: RollOutcome = 'NEUTRAL';
        if (!isFudge && faces === 20 && rolls.length === 1) {
            if (rollValues[0] === 20) outcome = 'CRITICAL_SUCCESS';
            else if (rollValues[0] === 1) outcome = 'CRITICAL_FAILURE';
        }

        let breakdown = '';
        if (isFudge) {
            const fudgeStr = fudgeSymbols.join(' ');
            breakdown = mod !== 0 ? `${fudgeStr} + ${mod} = ${finalTotal}` : `${fudgeStr} = ${finalTotal}`;
        } else {
            const diceStr = rollValues.join(' + ');
            breakdown = mod !== 0 ? `(${diceStr}) + ${mod} = ${finalTotal}` : `${diceStr} = ${finalTotal}`;
        }

        const currentSkinId = diceSettings?.skinId || 'default';
        const currentSkin = DICE_SKINS.find(s => s.id === currentSkinId);

        const result: RollResult = {
            total: finalTotal, formula, breakdown, outcome, authorName, label, visibility,
            dieType: isFudge ? 'F' as any : faces,
            authorId: 'local-user',
            skin: currentSkin,
            settings: diceSettings,
        };

        set({
            isRolling: false,
            lastResults: [result],
            lastResult: result,
            active3DRolls: rolls,
            pendingRollRequest: null
        });

        if (diceSettings?.enableSfx !== false) {
            setTimeout(() => {
                useAudioStore.getState().playSfx('/assets/dice-box/sounds/dice-throw-2.mp3');
            }, 300);
        }
    }
}));