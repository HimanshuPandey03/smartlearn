import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ message = "Something went wrong.", onRetry, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-100 rounded-xl min-h-[200px] ${className}`}>
      <AlertCircle className="w-10 h-10 text-danger mb-4" />
      <h3 className="text-lg font-semibold text-danger mb-2">Error</h3>
      <p className="text-sm text-red-700 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>Try Again</Button>
      )}
    </div>
  );
};

export default ErrorState;
