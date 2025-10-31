"use client";

type ButtonGroupProps<T extends string> = {
  options: readonly T[];
  value: T | '';
  onChange: (value: T) => void;
  renderLabel?: (option: T) => React.ReactNode;
  className?: string;
  buttonClassName?: string;
};

export function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  renderLabel,
  className = '',
  buttonClassName = ''
}: ButtonGroupProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              px-4 py-2 text-sm rounded-md transition-all
              ${isActive
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }
              ${buttonClassName}
            `}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
