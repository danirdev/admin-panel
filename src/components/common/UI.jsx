import React from 'react';

export const AdminButton = ({ children, variant = 'primary', icon: Icon, onClick, className = '', ...props }) => {
  const styles = {
    primary: "bg-black text-white hover:bg-gray-800",
    success: "bg-green-400 text-black hover:bg-green-500",
    danger: "bg-red-400 text-black hover:bg-red-500",
    outline: "bg-white text-black hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 border-transparent shadow-none"
  };

  return (
    <button 
      onClick={onClick}
      className={`${styles[variant]} px-4 py-2.5 font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', color = 'bg-white' }) => (
  <div className={`${color} border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, type = 'default' }) => {
  const colors = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-300 text-green-900",
    warning: "bg-yellow-300 text-yellow-900",
    danger: "bg-red-300 text-red-900",
  };
  return (
    <span className={`${colors[type]} px-2 py-1 rounded-md border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]`}>
      {children}
    </span>
  );
};
