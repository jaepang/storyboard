'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import AnnotationCanvas from '@/components/editor/AnnotationCanvas';
import AnnotationToolbar from '@/components/editor/AnnotationToolbar';
import type { Annotation } from '@/types/annotation';

/**
 * 곡 편집 페이지 - 주석 작성 기능
 * Path: /conti/[id]/song/[song_id]
 */
export default function SongAnnotationPage({
  params,
}: {
  params: Promise<{ id: string; song_id: string }>;
}) {
  const { id: contiId, song_id: songId } = use(params);
  const router = useRouter();

  const [annotations, setAnnotations] = useState<Annotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 주석 도구 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [pageIndex] = useState(0); // 현재는 단일 페이지만 지원

  // 주석 데이터 로드
  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await fetch(`/api/conti/${contiId}/song/${songId}/annotations`);
        if (!response.ok) {
          throw new Error('주석을 불러오지 못했습니다.');
        }
        const result = await response.json();
        setAnnotations(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '주석 로드 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, [contiId, songId]);

  // 주석 저장
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/conti/${contiId}/song/${songId}/annotations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotations || { annotations: [] }),
      });

      if (!response.ok) {
        throw new Error('주석 저장에 실패했습니다.');
      }

      alert('주석이 저장되었습니다.');
      router.push(`/conti/${contiId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 모두 지우기
  const handleClear = () => {
    if (confirm('모든 주석을 지우시겠습니까?')) {
      setAnnotations({ annotations: [] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">악보 주석 작성</h1>
        <div className="mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/conti/${contiId}`)}
          >
            ← 뒤로 가기
          </Button>
        </div>
      </div>

      {error && <ErrorMessage title="오류" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 주석 도구 */}
        <div className="lg:col-span-1">
          <AnnotationToolbar
            isDrawing={isDrawing}
            color={color}
            strokeWidth={strokeWidth}
            onToggleDrawing={() => setIsDrawing(!isDrawing)}
            onColorChange={setColor}
            onStrokeWidthChange={setStrokeWidth}
            onClear={handleClear}
            onSave={handleSave}
          />
        </div>

        {/* 캔버스 */}
        <div className="lg:col-span-3">
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <p className="text-sm text-gray-600 mb-4">
              {isDrawing
                ? '드로잉 모드: 캔버스에 마우스로 그려주세요'
                : '드로잉 모드가 꺼져 있습니다. 드로잉 시작 버튼을 누르세요.'}
            </p>
            <AnnotationCanvas
              pageIndex={pageIndex}
              annotations={annotations}
              color={color}
              strokeWidth={strokeWidth}
              isDrawing={isDrawing}
              onAnnotationsChange={setAnnotations}
            />
          </div>
        </div>
      </div>

      {/* 저장 버튼 (하단) */}
      <div className="mt-6 flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/conti/${contiId}`)}
          disabled={isSaving}
        >
          취소
        </Button>
        <Button type="button" variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : '저장하고 닫기'}
        </Button>
      </div>
    </div>
  );
}
