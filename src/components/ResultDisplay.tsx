import React from 'react';
import { useDiceStore } from '../stores/diceStore';

const styles = {
    container: {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        padding: '24px',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        borderRadius: '12px',
        border: '1px solid rgba(79, 70, 229, 0.5)',
        textAlign: 'center' as 'center',
    },
    label: {
        color: '#9ca3af',
        fontSize: '0.875rem',
        fontWeight: 'bold',
    },
    total: {
        fontSize: '4.5rem',
        fontWeight: 'bold',
        color: 'white',
        margin: '8px 0',
    },
    breakdown: {
        color: '#6b7280',
        fontSize: '0.75rem',
    }
};

const ResultDisplay: React.FC = () => {
    const { lastResult, isRolling } = useDiceStore();

    if (isRolling && !lastResult) {
        return <div style={styles.container}><div style={{...styles.total, fontSize: '2rem'}}>Rolando...</div></div>;
    }

    if (!lastResult) return null;

    return (
        <div style={styles.container}>
            <p style={styles.label}>{lastResult.label}</p>
            <h2 style={styles.total}>{lastResult.total}</h2>
            <p style={styles.breakdown}>{lastResult.breakdown}</p>
        </div>
    );
};

export default ResultDisplay;
