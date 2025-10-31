import { InputHTMLAttributes } from 'react';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  className?: string;
};

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          type="checkbox"
          className="w-4 h-4 rounded-sm border border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        <label className="text-xs text-neutral-700 cursor-pointer select-none">
          {label}
        </label>
      </div>
    );
  }

  return (
    <input
      type="checkbox"
      className={`w-4 h-4 rounded-sm border border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
