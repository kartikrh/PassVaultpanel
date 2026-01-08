import React, { useEffect, useRef } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose, id, autoClose = false, duration = 3000 }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (autoClose && duration > 0) {
      timerRef.current = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [autoClose, duration, id, onClose]);

  const handleManualClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onClose(id);
  };

  return (
    <div className={`custom-toast custom-toast-${type}`} role="alert">
      <div className="toast-content">
        <div className="toast-icon">
          <i className={`mdi ${type === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'}`}></i>
        </div>
        <div className="toast-message">{message}</div>
        <button 
          className="toast-close-btn" 
          onClick={handleManualClose}
          aria-label="Close notification"
        >
          <i className="mdi mdi-close"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;