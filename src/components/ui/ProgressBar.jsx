import React from 'react';

const ProgressBar = ({ progress, className = '', height = 'h-2', showLabel = false }) => {
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div 
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
