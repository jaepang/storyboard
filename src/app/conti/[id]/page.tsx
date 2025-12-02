'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import ConflictModal from '@/components/common/ConflictModal';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import ContiForm from '@/components/conti/ContiForm';
import SongForm from '@/components/song/SongForm';
import SongList from '@/components/song/SongList';
import type { ContiWithSongs, UpdateContiRequest } from '@/types/conti';
import type { ContiSong, CreateSongRequest, UpdateSongRequest } from '@/types/song';

export default function EditContiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [conti, setConti] = useState<ContiWithSongs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddingSong, setIsAddingSong] = useState(false);
  const [editingSong, setEditingSong] = useState<ContiSong | null>(null);
  const [isSongFormLoading, setIsSongFormLoading] = useState(false);

  const [conflictInfo, setConflictInfo] = useState<{
    currentVersion: number;
    providedVersion: number;
    pendingData: UpdateContiRequest | UpdateSongRequest;
    endpoint: string;
  } | null>(null);

  useEffect(() => {
    fetchConti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchConti = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/conti/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘티 조회에 실패했습니다.');
      }

      const result = await response.json();
      setConti(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContiUpdate = async (data: UpdateContiRequest) => {
    if (!conti) return;

    try {
      const response = await fetch(`/api/conti/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        const errorData = await response.json();
        setConflictInfo({
          currentVersion: errorData.details?.current_version,
          providedVersion: errorData.details?.provided_version,
          pendingData: data,
          endpoint: `/api/conti/${id}`,
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘티 수정에 실패했습니다.');
      }

      await fetchConti();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleAddSong = async (data: CreateSongRequest) => {
    setIsSongFormLoading(true);

    try {
      const response = await fetch(`/api/conti/${id}/song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '곡 추가에 실패했습니다.');
      }

      await fetchConti();
      setIsAddingSong(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSongFormLoading(false);
    }
  };

  const handleEditSong = async (data: UpdateSongRequest) => {
    if (!editingSong) return;

    setIsSongFormLoading(true);

    try {
      const response = await fetch(`/api/conti/${id}/song/${editingSong.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        const errorData = await response.json();
        setConflictInfo({
          currentVersion: errorData.details?.current_version,
          providedVersion: errorData.details?.provided_version,
          pendingData: data,
          endpoint: `/api/conti/${id}/song/${editingSong.id}`,
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '곡 수정에 실패했습니다.');
      }

      await fetchConti();
      setEditingSong(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSongFormLoading(false);
    }
  };

  const handleDeleteSong = async (song: ContiSong) => {
    if (!confirm(`"${song.title}" 곡을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/conti/${id}/song/${song.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '곡 삭제에 실패했습니다.');
      }

      await fetchConti();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleCopySong = async (song: ContiSong) => {
    try {
      const response = await fetch(`/api/conti/${id}/song/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_conti_song_id: song.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '곡 복사에 실패했습니다.');
      }

      await fetchConti();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleReorderSongs = async (newOrder: ContiSong[]) => {
    try {
      const response = await fetch(`/api/conti/${id}/song/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_ids: newOrder.map((s) => s.id) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '곡 순서 변경에 실패했습니다.');
      }

      await fetchConti();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      throw err;
    }
  };

  const handleConflictOverwrite = async () => {
    if (!conflictInfo) return;

    const { pendingData, endpoint } = conflictInfo;

    try {
      // Force update by incrementing version
      const updatedData = { ...pendingData, version: (pendingData as { version: number }).version + 1 };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('덮어쓰기에 실패했습니다.');
      }

      setConflictInfo(null);
      await fetchConti();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleConflictCancel = () => {
    setConflictInfo(null);
    fetchConti();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="large" text="콘티 불러오는 중..." />
      </div>
    );
  }

  if (error && !conti) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage title="콘티 조회 실패" message={error} onRetry={fetchConti} />
        </div>
      </div>
    );
  }

  if (!conti) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Error Display */}
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

        {/* Conti Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">콘티 편집</h1>
            <Button variant="secondary" onClick={() => router.back()}>
              뒤로
            </Button>
          </div>

          <ContiForm initialData={conti} onSubmit={handleContiUpdate} isLoading={false} />
        </div>

        {/* Songs Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">곡 목록</h2>
            <Button
              variant="primary"
              onClick={() => setIsAddingSong(true)}
              disabled={isAddingSong || !!editingSong}
            >
              곡 추가
            </Button>
          </div>

          {/* Add Song Form */}
          {isAddingSong && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">새 곡 추가</h3>
              <SongForm
                onSubmit={handleAddSong}
                onCancel={() => setIsAddingSong(false)}
                isLoading={isSongFormLoading}
              />
            </div>
          )}

          {/* Edit Song Form */}
          {editingSong && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-4">곡 수정</h3>
              <SongForm
                initialData={editingSong}
                onSubmit={handleEditSong}
                onCancel={() => setEditingSong(null)}
                isLoading={isSongFormLoading}
              />
            </div>
          )}

          {/* Song List */}
          <SongList
            songs={conti.songs}
            onReorder={handleReorderSongs}
            onEdit={setEditingSong}
            onDelete={handleDeleteSong}
            onCopy={handleCopySong}
          />
        </div>
      </div>

      {/* Conflict Modal */}
      {conflictInfo && (
        <ConflictModal
          isOpen={true}
          currentVersion={conflictInfo.currentVersion}
          providedVersion={conflictInfo.providedVersion}
          onOverwrite={handleConflictOverwrite}
          onCancel={handleConflictCancel}
        />
      )}
    </div>
  );
}
