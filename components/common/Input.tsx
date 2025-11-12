import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  const inputId = id || props.name;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-amber-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default Input;
