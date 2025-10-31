import { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full text-xs border rounded px-2 py-1 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
