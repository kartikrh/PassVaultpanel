import './SegmentedSwitch.css';

const SegmentedSwitch = ({ options, selectedValue, onSelectionChange, label }) => {
    const selectedIndex = options?.findIndex(opt => opt.value === selectedValue);

    const sliderStyle = {
        width: `calc(${100 / options?.length}% - 1px)`,
        left: `calc(${selectedIndex * (100 / options?.length)}% + 1px)`
    };

    return (
        <>
            <span className="segmented-switch-label">{label}</span>
            <div className="segmented-switch-container">
                <div
                    className={`segmented-switch-slider ${selectedIndex >= 0 ? 'opacity-100' : 'opacity-0'}`}
                    style={sliderStyle}
                />

                {options?.map((option) => {
                    const isSelected = selectedValue === option.value;

                    return (
                        <button
                            key={option.value}
                            onClick={() => onSelectionChange(option.value, option.label)}
                            className={`segmented-switch-button ${isSelected ? 'selected' : ''}`}
                        >
                            <span className="segmented-switch-button-content">
                                {option.label}
                            </span>

                            <div className={`segmented-switch-ripple ${isSelected ? 'selected' : ''}`} />
                            <div className="segmented-switch-glow" />
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default SegmentedSwitch;