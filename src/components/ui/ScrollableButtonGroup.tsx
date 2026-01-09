"use client";

type ScrollableButtonGroupProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
  getItemLabel?: (option: string) => string;
  getItemTitle?: (option: string) => string;
};

export function ScrollableButtonGroup({
  options,
  value,
  onChange,
  buttonClassName = '',
  getItemLabel,
  getItemTitle
}: ScrollableButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const label = getItemLabel ? getItemLabel(option) : option;
        const title = getItemTitle ? getItemTitle(option) : undefined;

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            title={title}
            aria-label={title || option}
            className={`
              flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-sm transition-colors
              ${value === option
                ? 'bg-blue-600 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }
              ${buttonClassName}
            `}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
