import React from 'react';
import { useThemeStore } from '../stores/themeStore';

const styles = {
    sectionTitle: {
        color: '#9ca3af',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase' as 'uppercase',
        marginBottom: '8px',
    },
};

const ThemeCustomizer: React.FC = () => {
    const { floorColor, setFloorColor } = useThemeStore();

    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Floor Color */}
            <div>
                <h3 style={styles.sectionTitle}>Piso (Feltro)</h3>
                <input
                    type="color"
                    value={floorColor}
                    onChange={(e) => setFloorColor(e.target.value)}
                    style={{ width: '100%', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '4px' }}
                />
            </div>
        </div>
    );
};

export default ThemeCustomizer;