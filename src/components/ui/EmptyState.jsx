import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({ title = "No data found", description = "There is nothing to display here yet.", icon: Icon = FolderOpen, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-100 rounded-xl min-h-[200px] ${className}`}>
      <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-secondary mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
    </div>
  );
};

export default EmptyState;
