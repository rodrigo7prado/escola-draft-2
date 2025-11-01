"use client";

import { createContext, useContext, useState } from "react";
import { Button } from "./Button";

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

type TabsVariant = "default" | "secondary" | "tertiary";

export function Tabs({
  defaultValue,
  children,
  variant = "default"
}: {
  defaultValue: string;
  children: React.ReactNode;
  variant?: TabsVariant;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div data-tabs-variant={variant} className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  variant = "default"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
}) {
  const baseClasses = "flex items-center gap-1 border-b flex-shrink-0";

  const variantClasses = {
    default: "mb-3",
    secondary: "mb-2",
    tertiary: "mb-1.5"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  variant = "default"
}: {
  value: string;
  children: React.ReactNode;
  variant?: TabsVariant;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be inside Tabs");
  const { activeTab, setActiveTab } = ctx;

  const variantClasses = {
    default: "px-4 py-2 text-sm",
    secondary: "px-3 py-1.5 text-xs",
    tertiary: "px-2 py-1 text-[11px]"
  };

  const activeClass = activeTab === value
    ? "border-neutral-900 font-medium"
    : "border-transparent hover:border-neutral-400";

  return (
    <Button
      onClick={() => setActiveTab(value)}
      variant="ghost"
      className={`${variantClasses[variant]} border-b-2 transition-colors ${activeClass} rounded-none h-auto`}
    >
      {children}
    </Button>
  );
}

export function TabsContent({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be inside Tabs");
  const { activeTab } = ctx;
  return <div className={`${activeTab === value ? "flex-1 min-h-0 flex flex-col" : "hidden"} ${className}`}>{children}</div>;
}

