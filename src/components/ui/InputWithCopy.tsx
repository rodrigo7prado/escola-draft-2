"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

type InputWithCopyProps = {
  value: string;
  className?: string;
  readOnly?: boolean;
  label?: string;
};

export function InputWithCopy({
  value,
  className = '',
  readOnly = true,
  label = 'Copiar'
}: InputWithCopyProps) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="relative">
      <Input
        value={value}
        readOnly={readOnly}
        className={`pr-8 ${className}`}
      />
      <Button
        onClick={copiar}
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto"
        title={copiado ? "Copiado!" : label}
        aria-label={copiado ? "Copiado!" : label}
        icon={copiado ? (
          <Check size={14} className="text-green-600" />
        ) : (
          <Copy size={14} className="text-neutral-500" />
        )}
      />
    </div>
  );
}
