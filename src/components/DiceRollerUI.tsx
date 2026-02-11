import React, { useState } from 'react';
import { useDiceStore } from '../stores/diceStore';
import ThemeCustomizer from './ThemeCustomizer'; // Import the new component

const styles = {
    container: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
        padding: '16px',
        borderRadius: '8px',
        pointerEvents: 'auto' as 'auto',
        width: '280px', // Fixed width for consistency
    },
    button: {
        width: '100%',
        height: '60px',
        backgroundColor: '#1f2937',
        color: 'white',
        border: '1px solid #4b5563',
        borderRadius: '8px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    tabBar: {
        display: 'flex',
        backgroundColor: '#111827',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '16px',
    },
    tabButton: {
        flex: 1,
        padding: '8px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase' as 'uppercase',
        color: '#9ca3af',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
    },
    activeTab: {
        backgroundColor: '#6366f1',
        color: 'white',
        boxShadow: '0 2px 10px rgba(99, 102, 241, 0.5)',
    }
};

const DiceRollerUI: React.FC = () => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'ROLL' | 'SKIN' | 'SETTINGS' | 'CENA'>('CENA');
    const { performSystemRoll, isRolling } = useDiceStore();

    const handleRoll = (faces: number) => {
        if (isRolling) return;
        const formula = `${quantity}d${faces}`;
        performSystemRoll('GENERIC', formula, `Rolagem de ${formula}`, 'Jogador');
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'CENA':
                return <ThemeCustomizer />;
            // Add SKIN and SETTINGS panels later
            // case 'SKIN':
            //     return <div>Skin Selector</div>;
            // case 'SETTINGS':
            //     return <div>Settings Panel</div>;
            case 'ROLL':
            default:
                return (
                    <div>
                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                            <label style={{ color: 'white', marginRight: '8px', fontWeight: 'bold' }}>Qtd:</label>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ width: '60px', textAlign: 'center', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563', borderRadius: '4px', padding: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <button onClick={() => handleRoll(4)} style={styles.button}>d4</button>
                            <button onClick={() => handleRoll(6)} style={styles.button}>d6</button>
                            <button onClick={() => handleRoll(8)} style={styles.button}>d8</button>
                            <button onClick={() => handleRoll(10)} style={styles.button}>d10</button>
                            <button onClick={() => handleRoll(12)} style={styles.button}>d12</button>
                            <button onClick={() => handleRoll(20)} style={styles.button}>d20</button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.tabBar}>
                {(['ROLL', 'SKIN', 'SETTINGS', 'CENA'] as const).map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        style={{ ...styles.tabButton, ...(activeTab === tab ? styles.activeTab : {}) }}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {renderActiveTab()}
        </div>
    );
}

export default DiceRollerUI;
