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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg
              className="h-12 w-12 text-yellow-500"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">동시 편집 충돌 감지</h2>
            <p className="text-gray-600 mb-4">
              다른 사용자가 이미 이 항목을 수정했습니다. 페이지를 새로고침하여 최신 버전을
              확인하거나, 현재 변경사항으로 덮어쓸 수 있습니다.
            </p>

            <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">제공된 버전:</span>
                <span className="font-mono font-semibold">v{providedVersion}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">현재 서버 버전:</span>
                <span className="font-mono font-semibold text-red-600">v{currentVersion}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
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
