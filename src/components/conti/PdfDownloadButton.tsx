'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';

export interface PdfDownloadButtonProps {
  contiId: string;
  contiTitle: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export default function PdfDownloadButton({
  contiId,
  contiTitle,
  variant = 'primary',
}: PdfDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pdf/${contiId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF 다운로드에 실패했습니다.');
      }

      // Get generation time from response headers
      const generationTime = response.headers.get('X-Generation-Time');
      if (generationTime) {
        console.log(`PDF generated in ${generationTime}`);
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contiTitle.replace(/[^a-zA-Z0-9가-힣\s]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <Button variant={variant} onClick={handleDownload} isLoading={isDownloading}>
        {isDownloading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <title>Loading</title>
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
            PDF 생성 중...
          </>
        ) : (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Download</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            PDF 다운로드
          </>
        )}
      </Button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
