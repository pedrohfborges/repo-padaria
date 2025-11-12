import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-2 border rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-orange-500 text-white border-transparent hover:bg-orange-600 focus:ring-orange-500',
    secondary: 'bg-white text-amber-700 border-orange-200 hover:bg-orange-50 focus:ring-orange-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
