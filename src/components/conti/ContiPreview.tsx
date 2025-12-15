'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

export interface ContiPreviewProps {
  contiId: string;
}

/**
 * Conti Preview Component
 *
 * Note: Full PDF preview would require react-pdf library.
 * For now, this provides a simple preview interface with download option.
 */
export default function ContiPreview({ contiId }: ContiPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pdf/${contiId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF 미리보기 생성에 실패했습니다.');
      }

      // Open PDF in new tab for preview
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF 미리보기</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-600">PDF 미리보기를 새 탭에서 열어 콘티를 확인하세요.</p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handlePreview} isLoading={isLoading}>
            {isLoading ? '생성 중...' : 'PDF 미리보기'}
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loading size="small" />
            <span>PDF를 생성하는 중입니다... (1-4초 소요)</span>
          </div>
        )}
      </div>

      {/* Future: Embed react-pdf viewer here */}
      <div className="mt-6 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-400">
        <svg
          className="mx-auto h-12 w-12 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>PDF Icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm">인라인 PDF 뷰어는 향후 추가 예정입니다</p>
        <p className="text-xs mt-1">(react-pdf 라이브러리 필요)</p>
      </div>
    </div>
  );
}
