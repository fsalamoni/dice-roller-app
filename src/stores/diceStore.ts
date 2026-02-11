import { create } from "zustand";
import { DICE_SKINS, useUserStore } from "./userStore";
import { RollResult, SystemType, VisibilityMode } from "../types";

type RollOutcome = "NEUTRAL" | "CRITICAL_SUCCESS" | "CRITICAL_FAILURE";

interface ParsedRoll {
    qty: number;
    faces: number;
}

interface DiceState {
    isRolling: boolean;
    lastResult: RollResult | null;
    pendingRollRequest: {
        id: string;
        formula: string;
        rolls: ParsedRoll[];
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

const parseComplexFormula = (formula: string) => {
    const parts = formula.replace(/\s/g, "").toLowerCase().split("+");
    const rolls: ParsedRoll[] = [];
    let mod = 0;
    let isFudge = false;

    for (const part of parts) {
        if (part.includes("df")) {
            const [qtyStr] = part.split("df");
            rolls.push({ qty: qtyStr ? parseInt(qtyStr) : 4, faces: 6 });
            isFudge = true;
        } else if (part.includes("d")) {
            const [qtyStr, facesStr] = part.split("d");
            rolls.push({ qty: parseInt(qtyStr) || 1, faces: parseInt(facesStr) });
        } else {
            mod += parseInt(part) || 0;
        }
    }
    return { rolls, mod, isFudge };
};

export const useDiceStore = create<DiceState>((set, get) => ({
    isRolling: false,
    lastResult: null,
    pendingRollRequest: null,

    performSystemRoll: (system, formula, label, authorName) => {
        const { diceSettings } = useUserStore.getState();
        const { rolls, mod, isFudge } = parseComplexFormula(formula);
        if (rolls.length === 0) return;

        const totalQty = rolls.reduce((sum, roll) => sum + roll.qty, 0);
        if (totalQty > 20) return;

        const currentSkinId = diceSettings?.skinId || "default";
        const currentSkin = DICE_SKINS.find((s) => s.id === currentSkinId);
        const skinColor = currentSkin?.hexColor || "#4f46e5";
        const textColor = currentSkin?.text || "#ffffff";
        const theme = "default"; // Simplificado por enquanto

        set({
            isRolling: true,
            pendingRollRequest: {
                id: `roll-${Date.now()}`,
                formula, rolls, mod, isFudge, authorName, label, visibility: "PUBLIC",
                skinColor, textColor, theme,
            },
        });
    },

    finalizeDiceRoll: (physicsResults: number[]) => {
        const { pendingRollRequest } = get();
        if (!pendingRollRequest) return;

        const { formula, mod, authorName, label } = pendingRollRequest;
        const totalSum = physicsResults.reduce((a, b) => a + b, 0);
        const finalTotal = totalSum + mod;
        const breakdown = `(${physicsResults.join(" + ")}) ${mod > 0 ? `+ ${mod}` : ""} = ${finalTotal}`;

        const result: RollResult = {
            total: finalTotal, formula, breakdown, outcome: "NEUTRAL", authorName, label,
            visibility: "PUBLIC", dieType: "MIXED", authorId: "local-user",
        };

        set({
            isRolling: false,
            lastResult: result,
            pendingRollRequest: null,
        });
    },
}));
