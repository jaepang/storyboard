'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Input from '@/components/common/Input';

interface YoutubePlaylistInputProps {
  onPlaylistLoaded: (videoCount: number) => void;
}

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

      onPlaylistLoaded(data.data.videoCount);
      setUrl('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
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

      <p className="text-sm text-white/50">
        유튜브 재생목록 URL을 입력하면 영상 개수만큼 빈 곡이 자동으로 생성됩니다.
      </p>
    </div>
  );
}
