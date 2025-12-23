
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-[11px] font-semibold text-amber-800/70 uppercase tracking-wider mb-2 ml-0.5">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className="w-full px-4 py-3 bg-white border border-orange-100/60 rounded-xl focus:ring-4 focus:ring-orange-500/5 focus:border-orange-300 outline-none transition-all placeholder:text-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-sm text-amber-900"
      />
    </div>
  );
};

export default Input;
