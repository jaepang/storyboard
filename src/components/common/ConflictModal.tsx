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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative glass-card max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg
                className="h-7 w-7 text-yellow-400"
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
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-2">동시 편집 충돌 감지</h2>
            <p className="text-white/70 mb-4 text-sm">
              다른 사용자가 이미 이 항목을 수정했습니다. 페이지를 새로고침하여 최신 버전을
              확인하거나, 현재 변경사항으로 덮어쓸 수 있습니다.
            </p>

            <div className="glass-light rounded-xl p-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">제공된 버전:</span>
                <span className="font-mono font-semibold text-white">v{providedVersion}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-white/60">현재 서버 버전:</span>
                <span className="font-mono font-semibold text-red-400">v{currentVersion}</span>
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4 bg-yellow-500/10 border border-yellow-400/30">
              <p className="text-sm text-yellow-200/90">
                <strong>주의:</strong> 덮어쓰기를 선택하면 다른 사용자의 변경사항이 손실될 수
                있습니다.
              </p>
            </div>
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
