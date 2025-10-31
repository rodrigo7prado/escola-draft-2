"use client";

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ScrollableButtonGroupProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
  maxVisibleItems?: number; // Quantos itens mostrar ao mesmo tempo
};

export function ScrollableButtonGroup({
  options,
  value,
  onChange,
  buttonClassName = '',
  maxVisibleItems = 2
}: ScrollableButtonGroupProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Verifica se pode rolar para esquerda/direita
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Recheck on resize
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [options]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.7; // Scroll 70% da largura visível
    const newScrollLeft = direction === 'left'
      ? el.scrollLeft - scrollAmount
      : el.scrollLeft + scrollAmount;

    el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Botão esquerda */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="flex-shrink-0 w-6 h-8 flex items-center justify-center bg-neutral-200 hover:bg-neutral-300 rounded text-neutral-700"
          type="button"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Container de scroll */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded transition-colors
              ${value === option
                ? 'bg-blue-600 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }
              ${buttonClassName}
            `}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      {/* Botão direita */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="flex-shrink-0 w-6 h-8 flex items-center justify-center bg-neutral-200 hover:bg-neutral-300 rounded text-neutral-700"
          type="button"
          aria-label="Rolar para direita"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
