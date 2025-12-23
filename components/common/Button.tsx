
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-2.5 border rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform active:scale-95 shadow-sm';
  
  const variantClasses = {
    primary: 'bg-[#f97316] text-white border-transparent hover:bg-[#ea580c] focus:ring-orange-500',
    secondary: 'bg-white text-amber-800 border-orange-200 hover:bg-orange-50 focus:ring-orange-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${props.className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
