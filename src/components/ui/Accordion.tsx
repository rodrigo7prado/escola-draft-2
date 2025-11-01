"use client";

import { useState, ReactNode, useEffect } from "react";
import { ExpandIcon } from "./ExpandIcon";

type AccordionProps = {
  defaultOpen?: boolean;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  onOpenChange?: (isOpen: boolean) => void;
};

export function Accordion({
  defaultOpen = false,
  trigger,
  children,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  onOpenChange,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer select-none shrink-0 ${triggerClassName}`}
      >
        <div className="flex items-center gap-2">
          <ExpandIcon isExpanded={isOpen} className="shrink-0" />
          {trigger}
        </div>
      </div>
      {isOpen && <div className={contentClassName}>{children}</div>}
    </div>
  );
}
