import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const baseStyles =
    'block w-full rounded-xl px-4 py-2.5 text-base glass-input disabled:opacity-50 disabled:cursor-not-allowed';

  const stateStyles = error
    ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/30'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${stateStyles} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="mt-2 text-sm text-white/50">
          {helperText}
        </p>
      )}
    </div>
  );
}
