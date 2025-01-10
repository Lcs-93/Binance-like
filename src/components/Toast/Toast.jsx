import React, { useEffect, useState } from 'react';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';

const Toast = ({ message, type }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 min-w-[300px]">
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 p-4">
          {type === 'success' ? (
            <RiCheckLine className={`text-xl ${type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
          ) : (
            <RiCloseLine className={`text-xl ${type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
          )}
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="h-1 w-full bg-gray-100">
          <div 
            className={`h-full transition-all duration-100 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
