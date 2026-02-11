import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import { useDiceStore } from "../stores/diceStore";
import { useThemeStore } from "../stores/themeStore";

const Dice3DLayer: React.FC = () => {
    const { pendingRollRequest, finalizeDiceRoll } = useDiceStore();
    const { floorColor } = useThemeStore();
    const [isReady, setIsReady] = useState(false);
    const boxRef = useRef<any>(null);
    const containerId = "dice-box-container";

    // Inicialização
    useEffect(() => {
        if (boxRef.current) return;
        const box = new DiceBox(`#${containerId}`, {
            assetPath: "/dice-roller-app/assets/dice-box/",
            floorColor: floorColor,
            scale: 5,
        });
        box.init().then(() => {
            boxRef.current = box;
            setIsReady(true);
        });
    }, [floorColor]);

    // Reação a mudanças de cor
    useEffect(() => {
        if (boxRef.current && isReady) {
            boxRef.current.updateConfig({ floorColor: floorColor });
        }
    }, [floorColor, isReady]);

    // Reação a pedidos de rolagem
    useEffect(() => {
        if (!isReady || !boxRef.current || !pendingRollRequest) return;
        
        const { rolls, skinColor } = pendingRollRequest;
        const rollParam = rolls.flatMap(roll => 
            Array.from({ length: roll.qty }, () => ({ sides: roll.faces, themeColor: skinColor }))
        );

        boxRef.current.clear();
        boxRef.current.roll(rollParam).then((results: any[]) => {
            const values = results.map(r => r.value);
            finalizeDiceRoll(values);
        });

    }, [pendingRollRequest, isReady, finalizeDiceRoll]);

    return <div id={containerId} className="fixed inset-0 w-full h-full z-0"></div>;
};

export default Dice3DLayer;
