import React from 'react';
import { Toast, ToastContainer as BootstrapToastContainer } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';
import '../styles/ToastContainer.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <BootstrapToastContainer position="top-end" className="p-3 custom-toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => removeToast(toast.id)}
          show={true}
          delay={3000}
          autohide
          className={`custom-toast custom-toast-${toast.type}`}
        >
          <Toast.Body>
            <div className="toast-content">
              <span className={`toast-icon toast-icon-${toast.type}`}>
                {getIcon(toast.type)}
              </span>
              <span className="toast-message">{toast.message}</span>
              <button
                type="button"
                className="toast-close-btn"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </Toast.Body>
        </Toast>
      ))}
    </BootstrapToastContainer>
  );
};

export default ToastContainer;
