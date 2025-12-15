'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Input from '@/components/common/Input';

interface YoutubePlaylistInputProps {
  /**
   * 곡 목록 생성 완료 시 호출되는 콜백
   * @param videoCount - 영상 개수
   */
  onPlaylistLoaded: (videoCount: number) => void;
}

/**
 * 유튜브 재생목록 URL 입력 컴포넌트
 *
 * 사용자가 유튜브 재생목록 URL을 입력하면 API를 호출하여
 * 영상 개수를 추출하고 초기 곡 목록을 생성합니다.
 */
export default function YoutubePlaylistInput({ onPlaylistLoaded }: YoutubePlaylistInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('유튜브 재생목록 URL을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '재생목록 정보를 가져오는데 실패했습니다.');
      }

      // 성공 시 부모 컴포넌트에 영상 개수 전달
      onPlaylistLoaded(data.data.videoCount);

      // 입력 초기화
      setUrl('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="youtube-playlist-input">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            aria-label="유튜브 재생목록 URL"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '곡 목록 생성'}
        </Button>
      </form>

      {error && <ErrorMessage message={error} />}

      <p className="mt-2 text-sm text-gray-600">
        유튜브 재생목록 URL을 입력하면 영상 개수만큼 빈 곡이 자동으로 생성됩니다.
      </p>
    </div>
  );
}
