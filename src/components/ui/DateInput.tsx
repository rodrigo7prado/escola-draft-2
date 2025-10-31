import { InputHTMLAttributes } from 'react';

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> & {
  value?: Date | string | null;
  className?: string;
};

export function DateInput({ value, className = '', ...props }: DateInputProps) {
  // Converter Date para string no formato yyyy-MM-dd
  const dateValue = value instanceof Date
    ? value.toISOString().split('T')[0]
    : value || '';

  return (
    <input
      type="date"
      value={dateValue}
      className={`w-full text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
