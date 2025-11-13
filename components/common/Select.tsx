import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  const selectId = id || props.name;
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-amber-700 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        {...props}
        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors"
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
