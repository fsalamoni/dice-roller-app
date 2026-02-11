import React from 'react';
import Dice3DLayer from './components/Dice3DLayer';
import DiceRollerUI from './components/DiceRollerUI'; 
import ResultDisplay from './components/ResultDisplay';

function App() {
  return (
    <main className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      <Dice3DLayer />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <ResultDisplay />
      </div>

      <div className="absolute bottom-4 right-4 z-20">
        <DiceRollerUI />
      </div>
    </main>
  );
}

export default App;
