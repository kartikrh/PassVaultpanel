import React from 'react';

const SegmentedSwitch = ({ options, selectedValue, onSelectionChange, label }) => {
    const selectedIndex = options?.findIndex(opt => opt.value === selectedValue);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        display: 'flex',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '12px',
        padding: '2px',
        // boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #475569',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto'
    };

    const sliderStyle: React.CSSProperties = {
        position: 'absolute',
        top: '2px',
        bottom: '2px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)',
        borderRadius: '10px',
        // boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.4), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
        width: `calc(${100 / options?.length}% - 1px)`,
        left: `calc(${selectedIndex * (100 / options?.length)}% + 1px)`,
        transform: selectedIndex >= 0 ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1
    };

    const getButtonStyle = (isSelected: boolean): React.CSSProperties => ({
        position: 'relative',
        zIndex: 10,
        flex: 1,
        padding: window.innerWidth < 640 ? '10px 12px' : '12px 16px',
        fontSize: window.innerWidth < 640 ? '12px' : '14px',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        color: isSelected ? '#ffffff' : '#cbd5e1',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
        whiteSpace: 'nowrap',
        outline: 'none'
    });

    const hoverStyle: React.CSSProperties = {
        color: '#ffffff',
        transform: 'scale(1.02)'
    };

    const rippleStyle = (isSelected: boolean): React.CSSProperties => ({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        transform: isSelected ? 'scale(1)' : 'scale(0)',
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'none'
    });

    const glowStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0), rgba(139, 92, 246, 0), rgba(236, 72, 153, 0))',
        borderRadius: '10px',
        transition: 'all 0.4s ease-out',
        pointerEvents: 'none',
        opacity: 0
    };

    return (
        <>
            <strong>{label}</strong>
            <div style={containerStyle}>
                <div style={sliderStyle} />

                {options?.map((option) => {
                    const isSelected = selectedValue === option.value;

                    return (
                        <button
                            key={option.value}
                            onClick={() => onSelectionChange(option.value, option.label)}
                            style={getButtonStyle(isSelected)}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    const target = e.target as HTMLButtonElement;
                                    Object.assign(target.style, hoverStyle);
                                    const glowEl = target.querySelector('.glow') as HTMLElement;
                                    if (glowEl) {
                                        glowEl.style.opacity = '1';
                                        glowEl.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))';
                                    }
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    const target = e.target as HTMLButtonElement;
                                    target.style.color = '#cbd5e1';
                                    target.style.transform = 'scale(1)';
                                    const glowEl = target.querySelector('.glow') as HTMLElement;
                                    if (glowEl) {
                                        glowEl.style.opacity = '0';
                                    }
                                }
                            }}
                            onMouseDown={(e) => {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = isSelected ? 'scale(1)' : 'scale(0.95)';
                            }}
                            onMouseUp={(e) => {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = isSelected ? 'scale(1.05)' : 'scale(1.02)';
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 20 }}>
                                {option.label}
                            </span>

                            <div style={rippleStyle(isSelected)} />
                            <div className="glow" style={glowStyle} />
                        </button>
                    );
                })}
            </div>
        </>
    );
};
export default SegmentedSwitch