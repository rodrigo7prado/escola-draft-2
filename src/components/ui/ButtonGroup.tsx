"use client";

import { Button } from './Button';

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
          <Button
            key={option}
            onClick={() => onChange(option)}
            variant={isActive ? 'primary' : 'secondary'}
            size="md"
            className={buttonClassName}
          >
            {renderLabel ? renderLabel(option) : option}
          </Button>
        );
      })}
    </div>
  );
}
