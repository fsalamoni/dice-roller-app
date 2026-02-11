// A simplified set of types needed for the dice roller
export type SystemType = 'FATE' | 'GENERIC';
export type VisibilityMode = 'PUBLIC' | 'PRIVATE'; // Simplified for our use case

export interface RollResult {
    total: number;
    formula: string;
    breakdown: string;
    dieType: number | 'F';
    outcome: 'NEUTRAL' | 'CRITICAL_SUCCESS' | 'CRITICAL_FAILURE';
    authorName: string;
    authorId: string;
    label: string;
    skin?: any;
    settings?: any;
    visibility: VisibilityMode;
}

export interface UserDiceSettings {
    skinId?: string;
    enable3D?: boolean;
    enableSfx?: boolean;
    enableShake?: boolean;
}
