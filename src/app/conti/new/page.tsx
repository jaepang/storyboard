'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import ContiForm, { type ContiFormData } from '@/components/conti/ContiForm';
import YoutubePlaylistInput from '@/components/conti/YoutubePlaylistInput';

export default function NewContiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialSongCount, setInitialSongCount] = useState<number | null>(null);

  const handleSubmit = async (data: ContiFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/conti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘티 생성에 실패했습니다.');
      }

      const result = await response.json();
      const contiId = result.data.id;

      // 유튜브 재생목록에서 곡 개수를 가져온 경우, 빈 곡들을 자동 생성
      if (initialSongCount && initialSongCount > 0) {
        try {
          // 곡 개수만큼 빈 곡 생성
          for (let i = 0; i < initialSongCount; i++) {
            await fetch(`/api/conti/${contiId}/song`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: `곡 ${i + 1}`,
                bpm: [],
                songForms: [],
              }),
            });
          }
        } catch (err) {
          console.error('초기 곡 생성 실패:', err);
          // 곡 생성 실패는 경고만 표시하고 계속 진행
        }
      }

      // Redirect to edit page with the new conti
      router.push(`/conti/${contiId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handlePlaylistLoaded = (videoCount: number) => {
    setInitialSongCount(videoCount);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">새 콘티 생성</h1>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} onRetry={() => setError(null)} />
            </div>
          )}

          {/* 유튜브 재생목록 연동 (선택사항) */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              유튜브 재생목록에서 곡 목록 생성 (선택사항)
            </h2>
            <YoutubePlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
            {initialSongCount && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ {initialSongCount}개의 곡이 생성될 예정입니다.
              </p>
            )}
          </div>

          <ContiForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
