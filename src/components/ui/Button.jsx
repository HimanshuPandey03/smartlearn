import React from 'react';

const variants = {
  primary: 'bg-primary text-white hover:bg-blue-700',
  secondary: 'bg-secondary text-white hover:bg-slate-800',
  outline: 'border-2 border-primary text-primary hover:bg-blue-50',
  ghost: 'text-secondary hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-700',
  white: 'bg-white text-primary hover:bg-slate-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  return (
    <button 
      className={`rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
