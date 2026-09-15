import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ToastAlert() {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {toasts.map(toast => {
        const bgClass = toast.type === 'success' ? 'bg-success text-white' :
                        toast.type === 'error' ? 'bg-danger text-white' :
                        toast.type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';
        return (
          <div key={toast.id} className={`toast show align-items-center ${bgClass} border-0 shadow-lg mb-2 fade-in`} role="alert">
            <div className="d-flex">
              <div className="toast-body fw-semibold py-2">
                {toast.message}
              </div>
              <button 
                type="button" 
                className={`btn-close ${toast.type !== 'warning' ? 'btn-close-white' : ''} me-2 m-auto`} 
                onClick={() => removeToast(toast.id)}
              ></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

