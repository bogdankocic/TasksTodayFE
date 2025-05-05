import React from 'react';
import { useToast } from './ToastContext';

const Toast = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2">
      {toasts.map(({ id, message }) => (
        <div
          key={id}
          className="bg-gray-800 text-white px-4 py-2 rounded shadow-md min-w-[250px] max-w-xs break-words"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
