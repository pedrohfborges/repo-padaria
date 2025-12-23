import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // FIX: Added optional onClick prop to CardProps to support event handling on the card container.
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;