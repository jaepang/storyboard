import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 focus:ring-purple-500 active:scale-95',
    secondary:
      'glass-card text-gray-700 hover:bg-white/95 hover:shadow-lg hover:-translate-y-0.5 focus:ring-indigo-500 active:scale-95',
    danger:
      'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 focus:ring-red-500 active:scale-95',
    ghost:
      'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:shadow-lg hover:-translate-y-0.5 focus:ring-white/50 active:scale-95',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-5 py-2.5 text-base gap-2',
    large: 'px-7 py-3.5 text-lg gap-2.5',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>로딩 중...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
