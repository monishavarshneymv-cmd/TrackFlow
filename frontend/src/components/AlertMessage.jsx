import React from 'react';

export default function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null;

  const alertClass = type === 'error' ? 'alert-danger' : type === 'success' ? 'alert-success' : 'alert-info';

  return (
    <div className={`alert ${alertClass}`}>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '12px' }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
