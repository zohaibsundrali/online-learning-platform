import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#5B4D4E',
            color: '#DBE2DC',
            borderRadius: '12px',
            border: '1px solid #6D5F60',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#8AA39B',
              secondary: '#4A3F40',
            },
          },
          error: {
            iconTheme: {
              primary: '#E07A5F',
              secondary: '#4A3F40',
            },
          },
        }}
      />
    </>
  );
};

// Custom hook for toast
export const useToast = () => {
  const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    loading: (message) => toast.loading(message),
    dismiss: (toastId) => toast.dismiss(toastId),
  };
  return showToast;
};