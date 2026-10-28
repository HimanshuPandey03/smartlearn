import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-secondary">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
