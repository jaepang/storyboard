export interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, title, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4" role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <svg
          className="h-6 w-6 flex-shrink-0 text-red-600"
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
          {title && <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>}
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
