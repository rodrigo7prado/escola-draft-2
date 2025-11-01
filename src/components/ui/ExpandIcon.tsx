type ExpandIconProps = {
  isExpanded?: boolean;
  className?: string;
};

export function ExpandIcon({
  isExpanded = false,
  className = "",
}: ExpandIconProps) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 text-neutral-600 ${
        isExpanded ? "rotate-90" : "rotate-0"
      } ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}