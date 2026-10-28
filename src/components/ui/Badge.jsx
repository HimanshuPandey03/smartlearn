import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
