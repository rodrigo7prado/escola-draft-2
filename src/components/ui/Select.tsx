import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>;
};

/**
 * Componente Select genérico
 */
export function Select({ options, className = "", ...props }: SelectProps) {
  const baseStyles =
    "w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed";

  return (
    <select className={`${baseStyles} ${className}`} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}