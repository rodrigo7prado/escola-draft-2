type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
};

export function FormField({
  label,
  children,
  className = "",
  required = false,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="text-[10px] text-neutral-500 block mb-0.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
