import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Toast = {
  id: number;
  message: string;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

// Global callback to be set by ToastProvider
let globalAddToast: ((message: string) => void) | null = null;

// Exported function to be called from anywhere to show toast
export const toast = (message: string) => {
  if (globalAddToast) {
    globalAddToast(message);
  } else {
    console.warn('ToastProvider is not mounted yet.');
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    toastId += 1;
    const id = toastId;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000); // 5 seconds
  }, []);

  // Set the global callback on mount and clear on unmount
  React.useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
