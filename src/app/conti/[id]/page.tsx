'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import ConflictModal from '@/components/common/ConflictModal';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import ContiForm, { type ContiFormData } from '@/components/conti/ContiForm';
import ContiPreview from '@/components/conti/ContiPreview';
import PdfDownloadButton from '@/components/conti/PdfDownloadButton';
import type { PageSettings } from '@/components/sheet-music/SheetMusicEditor';
import SheetMusicEditor from '@/components/sheet-music/SheetMusicEditor';
import SheetMusicUploader from '@/components/sheet-music/SheetMusicUploader';
import SongForm, { type SongFormData } from '@/components/song/SongForm';
import SongList from '@/components/song/SongList';
import { getSheetMusicUrl } from '@/lib/storage/download';
import type { ContiWithSongs } from '@/types/conti';
import type { ContiSong } from '@/types/song';

export default function EditContiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [conti, setConti] = useState<ContiWithSongs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddingSong, setIsAddingSong] = useState(false);
  const [editingSong, setEditingSong] = useState<ContiSong | null>(null);
  const [isSongFormLoading, setIsSongFormLoading] = useState(false);

  const [uploadingSong, setUploadingSong] = useState<ContiSong | null>(null);
  const [editingSheetMusic, setEditingSheetMusic] = useState<ContiSong | null>(null);

  const [conflictInfo, setConflictInfo] = useState<{
    currentVersion: number;
    providedVersion: number;
    pendingData: ContiFormData | SongFormData;
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

  const handleContiUpdate = async (data: ContiFormData) => {
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

  const handleAddSong = async (data: SongFormData) => {
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

  const handleEditSong = async (data: SongFormData) => {
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
      const updatedData = {
        ...pendingData,
        version: (pendingData as { version: number }).version + 1,
      };

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

  const handleUploadSuccess = async (_songId: string, _url: string, _pageCount: number) => {
    // 업로드 성공 시 곡 목록 새로고침
    await fetchConti();
    setUploadingSong(null);
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleSheetMusicEdit = (song: ContiSong) => {
    if (song.sheet_music_url) {
      setEditingSheetMusic(song);
    }
  };

  const handleSheetMusicSave = async (_song: ContiSong, pages: PageSettings[]) => {
    // TODO: 페이지 설정을 API로 저장 (Phase 7에서 구현 예정)
    console.log('Saving page settings:', pages);
    setEditingSheetMusic(null);
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
            <div className="flex gap-2">
              <PdfDownloadButton contiId={conti.id} contiTitle={conti.title} />
              <Button variant="secondary" onClick={() => router.back()}>
                뒤로
              </Button>
            </div>
          </div>

          <ContiForm initialData={conti} onSubmit={handleContiUpdate} isLoading={false} />
        </div>

        {/* PDF Preview Section */}
        <ContiPreview contiId={conti.id} />

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
            onUpload={setUploadingSong}
            onEditSheetMusic={handleSheetMusicEdit}
          />
        </div>

        {/* Sheet Music Upload Section */}
        {uploadingSong && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              악보 업로드: {uploadingSong.title}
            </h2>
            <SheetMusicUploader
              songId={uploadingSong.id}
              onUploadSuccess={(url, pageCount) =>
                handleUploadSuccess(uploadingSong.id, url, pageCount)
              }
              onUploadError={handleUploadError}
            />
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setUploadingSong(null)}>
                취소
              </Button>
            </div>
          </div>
        )}

        {/* Sheet Music Editor Section */}
        {editingSheetMusic?.sheet_music_url && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              악보 편집: {editingSheetMusic.title}
            </h2>
            <SheetMusicEditor
              sheetMusicUrl={getSheetMusicUrl(editingSheetMusic.sheet_music_url)}
              pageCount={editingSheetMusic.sheet_music_pages || 1}
              onSave={(pages) => handleSheetMusicSave(editingSheetMusic, pages)}
              onCancel={() => setEditingSheetMusic(null)}
            />
          </div>
        )}
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
