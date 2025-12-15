export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export default function Loading({ size = 'medium', text }: LoadingProps) {
  const sizeStyles = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const textSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <output className="flex flex-col items-center justify-center gap-3">
      <svg
        className={`animate-spin text-indigo-400 ${sizeStyles[size]}`}
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
      {text && <span className={`text-white/70 ${textSizeStyles[size]}`}>{text}</span>}
      <span className="sr-only">로딩 중...</span>
    </output>
  );
}
