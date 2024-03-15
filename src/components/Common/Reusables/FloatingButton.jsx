import React, { useState, useEffect, useRef } from 'react';
import "./CustomCss.css";

const FloatingButton = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const timeoutId = useRef(null);

    const closeOverlay = () => setIsOpen(false);

    const handleScroll = () => {
        setIsScrolling(true);
        clearTimeout(timeoutId.current);
        timeoutId.current = setTimeout(() => setIsScrolling(false), 500);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId.current);
        };
    }, []);

    return (
        <div>
            <button
                className={`floating-btn ${isScrolling ? 'isScrolling' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                Action
            </button>
            {isOpen && (
                <div className="overlay">
                    <div className="content">
                        <button className="close-btn" onClick={closeOverlay}>&times;</button>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingButton;