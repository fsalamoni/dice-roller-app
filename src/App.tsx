import React from "react";
import Dice3DLayer from "./components/Dice3DLayer";
import ControlPanel from "./components/ControlPanel";
import { useDiceStore } from "./stores/diceStore";

const ResultDisplay: React.FC = () => {
    const { lastResult } = useDiceStore();
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (lastResult) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 4000); // Mostra por 4 segundos
            return () => clearTimeout(timer);
        }
    }, [lastResult]);

    if (!isVisible || !lastResult) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 p-6 rounded-2xl border-2 border-indigo-500 shadow-2xl backdrop-blur-md text-white animate-in fade-in zoom-in-95">
            <div className="text-5xl font-black text-center">{lastResult.total}</div>
            <div className="text-xs text-slate-400 text-center mt-2">{lastResult.breakdown}</div>
        </div>
    );
};

function App() {
    return (
        <main className="relative w-screen h-screen bg-gray-900 overflow-hidden">
            <Dice3DLayer />
            <ResultDisplay />
            <div className="absolute bottom-4 right-4 z-20">
                <ControlPanel />
            </div>
        </main>
    );
}

export default App;
