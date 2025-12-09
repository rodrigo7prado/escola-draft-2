"use client";

import { useState, useRef, useEffect } from "react";

export type IconMenuOptions = "kebab" | "meatball" | "hamburger";

type MenuOption = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type OverflowMenuProps = {
  options: MenuOption[];
  icon?: IconMenuOptions;
  onSelect?: (option: MenuOption) => void;
};

const icons: Record<IconMenuOptions, string> = {
  kebab: "⋮",
  meatball: "⋯",
  hamburger: "☰",
};

/**
 * DRY.UI:OVERFLOW_MENU
 * Componente de menu de opções acionado por um ícone
 */
export function OverflowMenu({
  options,
  icon = "kebab",
  onSelect,
}: OverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleOptionClick = (option: MenuOption) => {
    if (option.disabled) return;

    option.onClick();
    onSelect?.(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Menu de opções"
        aria-expanded={isOpen}
      >
        <span className="text-xl leading-none">{icons[icon]}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled}
              className={`
                w-full text-left px-4 py-2 text-sm transition-colors
                ${
                  option.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}