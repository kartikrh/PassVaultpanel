import React from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose, id }) => {
  return (
    <div className={`custom-toast custom-toast-${type}`} role="alert">
      <div className="toast-content">
        <div className="toast-icon">
          <i className="mdi mdi-alert-circle-outline"></i>
        </div>
        <div className="toast-message">{message}</div>
        <button 
          className="toast-close-btn" 
          onClick={() => onClose(id)}
          aria-label="Close notification"
        >
          <i className="mdi mdi-close"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;