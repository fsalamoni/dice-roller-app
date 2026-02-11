import React, { useState } from "react";
import { useDiceStore } from "../stores/diceStore";
import { useThemeStore } from "../stores/themeStore";

const DiceButton: React.FC<{ sides: number; onRoll: () => void }> = ({ sides, onRoll }) => (
    <button
        onClick={onRoll}
        className="aspect-square bg-slate-800 hover:bg-slate-700 rounded-lg flex flex-col items-center justify-center border border-slate-600 transition-all hover:scale-105 active:scale-95 group shadow-md"
    >
        <span className="text-xl font-bold text-white">d{sides}</span>
    </button>
);

const ControlPanel: React.FC = () => {
    const { performSystemRoll } = useDiceStore();
    const { floorColor, setFloorColor } = useThemeStore();
    const [quantity, setQuantity] = useState(1);
    const [formula, setFormula] = useState("");

    const handleManualRoll = (faces: number) => {
        performSystemRoll("dnd5e", `${quantity}d${faces}`, `Rolagem de ${quantity}d${faces}`, "Jogador");
    };

    const handleFormulaRoll = () => {
        if (formula.trim()) {
            performSystemRoll("dnd5e", formula, `Rolagem de ${formula}`, "Jogador");
        }
    };

    return (
        <div className="w-80 h-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 text-white font-sans">
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                    {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                        <DiceButton key={sides} sides={sides} onRoll={() => handleManualRoll(sides)} />
                    ))}
                    <div className="col-span-2 flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-600">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 rounded bg-slate-700 text-indigo-400 hover:bg-slate-600">-</button>
                        <span className="text-lg font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-6 h-6 rounded bg-slate-700 text-indigo-400 hover:bg-slate-600">+</button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleFormulaRoll(); }}
                        placeholder="ex: 2d6 + 1d8 + 5"
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={handleFormulaRoll} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm">
                        Rolar
                    </button>
                </div>
                <hr className="border-slate-700" />
                <div>
                    <h2 className="text-xs font-bold uppercase text-slate-400 mb-2">Cenário</h2>
                    <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-600">
                        <label htmlFor="floorColor" className="text-sm font-medium">Cor do Piso</label>
                        <input
                            type="color"
                            id="floorColor"
                            value={floorColor}
                            onChange={(e) => setFloorColor(e.target.value)}
                            className="w-10 h-8 rounded border-none cursor-pointer bg-transparent"
                            style={{ backgroundColor: floorColor }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;