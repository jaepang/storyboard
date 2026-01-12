'use client';

import Button from './Button';

export interface ConflictModalProps {
  isOpen: boolean;
  currentVersion: number;
  providedVersion: number;
  onOverwrite: () => void;
  onCancel: () => void;
}

export default function ConflictModal({
  isOpen,
  currentVersion,
  providedVersion,
  onOverwrite,
  onCancel,
}: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative glass-card rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">동시 편집 충돌 감지</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              다른 사용자가 이미 이 항목을 수정했습니다. 페이지를 새로고침하여 최신 버전을
              확인하거나, 현재 변경사항으로 덮어쓸 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="glass rounded-xl p-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">제공된 버전:</span>
              <span className="font-mono font-semibold px-2 py-0.5 bg-gray-100 rounded">
                v{providedVersion}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">현재 서버 버전:</span>
              <span className="font-mono font-semibold px-2 py-0.5 bg-red-100 text-red-600 rounded">
                v{currentVersion}
              </span>
            </div>
          </div>

          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>주의:</strong> 덮어쓰기를 선택하면 다른 사용자의 변경사항이 손실될 수
                있습니다.
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={onCancel}>
            취소하고 새로고침
          </Button>
          <Button variant="danger" onClick={onOverwrite}>
            덮어쓰기
          </Button>
        </div>
      </div>
    </div>
  );
}
