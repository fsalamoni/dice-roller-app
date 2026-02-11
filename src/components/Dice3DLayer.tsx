import React, { useEffect, useRef, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';
import { useDiceStore } from '../stores/diceStore';
import { useThemeStore } from '../stores/themeStore';

const Dice3DLayer: React.FC = () => {
    const { pendingRollRequest, finalizeDiceRoll } = useDiceStore();
    const [isReady, setIsReady] = useState(false);
    const { floorColor } = useThemeStore();
    const [resultBadge, setResultBadge] = useState<{ total: number, label: string } | null>(null);

    // Refs for persistence
    const boxRef = useRef<any>(null);
    const lastProcessedRequestId = useRef<string | null>(null);
    const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize DiceBox
    useEffect(() => {
        if (!containerRef.current || boxRef.current) return;

        console.log("🎲 Initializing DiceBox...");

        const box = new DiceBox({
            container: containerRef.current, // Use ref instead of selector
            assetPath: '/dice-roller-app/assets/dice-box/',
            scale: 4,
            theme: 'default',
            offscreen: true, // Let's enable worker for production
            gravity: 3,
            mass: 3,
            friction: 0.8,
            restitution: 0.5,
            lightIntensity: 1.5,
        });

        box.init().then(() => {
            console.log("🎲 DiceBox Ready!");
            boxRef.current = box;
            setIsReady(true);
        }).catch(e => {
            console.error("🎲 DiceBox Init Error:", e);
        });

    }, []);


    // Handle Theme Changes
    useEffect(() => {
        if (boxRef.current && isReady) {
            console.log("🎲 Applying theme changes:", { floorColor });
            boxRef.current.updateConfig({
                themeColor: floorColor,
            });
        }
    }, [floorColor, isReady]);

    // Handle Pending Request
    useEffect(() => {
        if (!isReady || !boxRef.current || !pendingRollRequest) return;

        // Prevent duplicate processing
        if (lastProcessedRequestId.current === pendingRollRequest.id) return;
        lastProcessedRequestId.current = pendingRollRequest.id;

        // 1. CANCEL PREVIOUS CLEANUP
        // Critical Fix: Cancel any pending clear() from previous rolls to prevent "phantom clears"
        if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
        }

        const { qty, faces, skinColor, isFudge, theme } = pendingRollRequest;

        const processRoll = async () => {
            console.log("🎲 Processing Roll Request:", pendingRollRequest);

            // Update Config for Skin - NOW AWAITED to prevent race condition
            try {
                // FUDGE DICE: Use divine_*_fudge variants for textured skins, or fudge3 for solid skins
                // NORMAL DICE: Use divine themes for texture-based skins, default for others
                let activeTheme: string;
                if (isFudge) {
                    // For Fudge dice, use the fudge variant of divine themes or standard fudge3
                    if (theme && theme.startsWith('divine_')) {
                        activeTheme = `${theme}_fudge`; // e.g., divine_nebula_fudge
                    } else {
                        activeTheme = 'fudge3';
                    }
                } else {
                    // For normal dice, use divine or default
                    activeTheme = (theme && theme.startsWith('divine_')) ? theme : 'default';
                }
                await boxRef.current.updateConfig({
                    theme: activeTheme,
                    themeColor: skinColor,
                    scale: 4,
                    lightIntensity: 1.5
                });
            } catch (err) {
                console.warn("⚠️ Theme update warning, falling back to default:", err);
                // Fallback to default theme if divine theme fails
                await boxRef.current.updateConfig({
                    theme: isFudge ? 'fudge3' : 'default',
                    themeColor: skinColor,
                    scale: 4,
                    lightIntensity: 1.5
                });
            }

            // Ensure physics world is clean before adding new bodies
            boxRef.current.clear();

            // 1. Execute STANDARD PHYSICS ROLL (Random)
            // IMPORTANT: Use .map() to create UNIQUE objects for each die.
            // Array.fill({}) would create shared references, causing dice-box issues.
            const rollParam = Array.from({ length: qty }, () => ({
                sides: faces,
                themeColor: skinColor
            }));

            // 1a. WATCHDOG TIMER (Safety Net)
            // Dynamic timeout based on dice count - more dice = more physics time needed
            const baseTimeout = 4000; // 4s for 1-4 dice
            const timeoutMs = qty <= 4 ? baseTimeout
                : qty <= 10 ? 6000  // 6s for 5-10 dice
                    : qty <= 20 ? 8000  // 8s for 11-20 dice
                        : 12000;            // 12s for 20+ dice (stress tests)

            const watchdog = setTimeout(() => {
                console.log(`🎲 Physics simulation exceeded ${timeoutMs / 1000}s for ${qty} dice. Using RNG fallback.`);

                if (boxRef.current) boxRef.current.clear();

                const fallbackResults = Array.from({ length: qty }, () => Math.floor(Math.random() * faces) + 1);
                finalizeDiceRoll(fallbackResults);

                // Show "RNG" badge instead of warning symbol for cleaner UX
                const total = fallbackResults.reduce((a, b) => a + b, 0);
                setResultBadge({ total, label: "RNG" });
                cleanupTimerRef.current = setTimeout(() => setResultBadge(null), 2000);
            }, timeoutMs);

            boxRef.current.roll(rollParam).then((results: any[]) => {
                clearTimeout(watchdog); // Physics finished, cancel safety net

                // 2. Extract Results
                const values = results.map(r => r.value);
                console.log("🎲 Physics Results:", values);

                // 3. Send to Store (Truth)
                finalizeDiceRoll(values);

                // 4. Show Local Badge
                let total = 0;
                let labelParts: string[] = [];

                if (isFudge) {
                    values.forEach((val: number) => {
                        // Mapeamento Fudge (Fate)
                        // 1,2 = -1 (Menos)
                        // 3,4 = 0  (Vazio)
                        // 5,6 = +1 (Mais)
                        if (val <= 2) { total += -1; labelParts.push("-"); }
                        else if (val <= 4) { total += 0; labelParts.push("▢"); }
                        else { total += 1; labelParts.push("+"); }
                    });
                } else {
                    total = values.reduce((acc, val) => acc + val, 0);
                    labelParts = values.map(v => v.toString());
                }

                const label = labelParts.join('  ');
                setResultBadge({ total, label });

                // Schedule Cleanup
                cleanupTimerRef.current = setTimeout(() => {
                    boxRef.current.clear();
                    setResultBadge(null);
                }, 5000); // 5s visible result
            }).catch((err: any) => {
                console.error("❌ Physics Error:", err);
                clearTimeout(watchdog);
                if (boxRef.current) boxRef.current.clear();
                const fallbackResults = Array(qty).fill(0).map(() => Math.floor(Math.random() * faces) + 1);
                finalizeDiceRoll(fallbackResults);
            });
        };

        processRoll();
    }, [pendingRollRequest, isReady, finalizeDiceRoll]);

    return (
        <>
            <style>
                {`
                #dice-box-new canvas {
                    width: 100% !important;
                    height: 100% !important;
                    display: block;
                }
                `}
            </style>
            <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                {/* Canvas Container */}
                <div ref={containerRef} className="absolute inset-0 w-full h-full block"></div>

                {/* Result Badge */}
                {resultBadge && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none animate-bounce-in">
                        <div className="bg-slate-900/90 text-white px-8 py-4 rounded-2xl border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] backdrop-blur-xl flex flex-col items-center gap-2">
                            <div className="text-5xl font-black bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                                {resultBadge.total}
                            </div>
                            <div className="text-xs font-bold tracking-widest uppercase text-slate-400">
                                {resultBadge.label}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dice3DLayer;
