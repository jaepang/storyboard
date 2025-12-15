export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  light?: boolean;
}

export default function Loading({ size = 'medium', text, light = false }: LoadingProps) {
  const sizeStyles = {
    small: 'h-5 w-5',
    medium: 'h-10 w-10',
    large: 'h-14 w-14',
  };

  const textSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const spinnerColor = light ? 'text-white' : 'text-indigo-500';
  const textColor = light ? 'text-white/80' : 'text-gray-600';

  return (
    <output className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <svg
          className={`animate-spin ${spinnerColor} ${sizeStyles[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <div
          className={`absolute inset-0 rounded-full ${
            light ? 'bg-white/10' : 'bg-indigo-500/10'
          } blur-xl animate-pulse`}
        />
      </div>
      {text && (
        <span className={`${textColor} ${textSizeStyles[size]} font-medium`}>{text}</span>
      )}
      <span className="sr-only">로딩 중...</span>
    </output>
  );
}
