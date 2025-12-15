'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';

export interface PageSettings {
  pageNumber: number;
  scale: number;
  rotation: number;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SheetMusicEditorProps {
  sheetMusicUrl: string;
  pageCount: number;
  onSave?: (pages: PageSettings[]) => void;
  onCancel?: () => void;
}

export default function SheetMusicEditor({
  sheetMusicUrl,
  pageCount,
  onSave,
  onCancel,
}: SheetMusicEditorProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<PageSettings[]>(
    Array.from({ length: pageCount }, (_, i) => ({
      pageNumber: i + 1,
      scale: 1.0,
      rotation: 0,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
    }
  };

  const handleScaleChange = (pageNumber: number, scale: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNumber ? { ...p, scale: Math.max(0.5, Math.min(2.0, scale)) } : p
      )
    );
  };

  const handleRotationChange = (pageNumber: number, rotation: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, rotation: rotation % 360 } : p))
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave?.(pages);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPageSettings = pages.find((p) => p.pageNumber === currentPage);

  return (
    <div className="w-full space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">악보 편집</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">
            페이지 {currentPage} / {pageCount}
          </span>
        </div>
      </div>

      {/* 악보 미리보기 영역 */}
      <div className="glass-light rounded-xl p-4">
        <div className="aspect-[1/1.414] rounded-lg bg-white/5 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-white/30">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>PDF 미리보기</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">페이지 {currentPage}</p>
              <p className="text-xs text-white/50 mt-1">
                크기: {(currentPageSettings?.scale || 1.0) * 100}%
              </p>
              <p className="text-xs text-white/50">회전: {currentPageSettings?.rotation || 0}°</p>
            </div>
            <a
              href={sheetMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              새 탭에서 열기
            </a>
          </div>
        </div>
      </div>

      {/* 페이지 네비게이션 */}
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </Button>
        <span className="text-sm text-white/70">
          {currentPage} / {pageCount}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          다음
        </Button>
      </div>

      {/* 페이지 편집 컨트롤 */}
      <div className="glass-light rounded-xl p-4 space-y-4">
        <h4 className="text-sm font-medium text-white">페이지 설정</h4>

        {/* 크기 조절 */}
        <div className="space-y-2">
          <label htmlFor="scale" className="block text-sm text-white/70">
            크기: {((currentPageSettings?.scale || 1.0) * 100).toFixed(0)}%
          </label>
          <div className="flex items-center gap-3">
            <input
              id="scale"
              type="range"
              min="50"
              max="200"
              step="10"
              value={(currentPageSettings?.scale || 1.0) * 100}
              onChange={(e) => handleScaleChange(currentPage, Number(e.target.value) / 100)}
              className="flex-1 accent-indigo-400"
            />
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => handleScaleChange(currentPage, 1.0)}
            >
              초기화
            </Button>
          </div>
        </div>

        {/* 회전 */}
        <div className="space-y-2">
          <label className="block text-sm text-white/70">
            회전: {currentPageSettings?.rotation || 0}°
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                handleRotationChange(currentPage, (currentPageSettings?.rotation || 0) - 90)
              }
            >
              왼쪽 90°
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                handleRotationChange(currentPage, (currentPageSettings?.rotation || 0) + 90)
              }
            >
              오른쪽 90°
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => handleRotationChange(currentPage, 0)}
            >
              초기화
            </Button>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
        )}
        {onSave && (
          <Button type="button" variant="primary" onClick={handleSave} isLoading={isLoading}>
            저장
          </Button>
        )}
      </div>
    </div>
  );
}
