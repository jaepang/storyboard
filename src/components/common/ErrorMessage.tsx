export interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, title, onRetry }: ErrorMessageProps) {
  return (
    <div className="glass-card rounded-xl border border-red-400/30 bg-red-500/10 p-4" role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <svg
          className="h-6 w-6 flex-shrink-0 text-red-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium text-red-300 mb-1">{title}</h3>}
          <p className="text-sm text-red-200/80">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-300 hover:text-red-200 underline transition-colors"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
