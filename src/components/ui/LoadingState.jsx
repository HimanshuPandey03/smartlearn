import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 min-h-[200px] ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
};

export default LoadingState;
