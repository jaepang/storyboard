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

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchConti is defined after useEffect
  useEffect(() => {
    fetchConti();
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
      <div className="flex-1 flex items-center justify-center py-12">
        <Loading size="large" text="콘티 불러오는 중..." light />
      </div>
    );
  }

  if (error && !conti) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
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
    <div className="flex-1 py-6 lg:py-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="fade-in">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {/* Conti Info Section */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">콘티 편집</h1>
            <div className="flex gap-2">
              <PdfDownloadButton contiId={conti.id} contiTitle={conti.title} />
              <Button variant="secondary" size="small" onClick={() => router.back()}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                뒤로
              </Button>
            </div>
          </div>

          <ContiForm initialData={conti} onSubmit={handleContiUpdate} isLoading={false} />
        </div>

        {/* PDF Preview Section */}
        <ContiPreview contiId={conti.id} />

        {/* Songs Section */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">곡 목록</h2>
            <Button
              variant="primary"
              size="small"
              onClick={() => setIsAddingSong(true)}
              disabled={isAddingSong || !!editingSong}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              곡 추가
            </Button>
          </div>

          {/* Add Song Form */}
          {isAddingSong && (
            <div className="mb-6 p-5 glass rounded-xl slide-up">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                새 곡 추가
              </h3>
              <SongForm
                onSubmit={handleAddSong}
                onCancel={() => setIsAddingSong(false)}
                isLoading={isSongFormLoading}
              />
            </div>
          )}

          {/* Edit Song Form */}
          {editingSong && (
            <div className="mb-6 p-5 glass rounded-xl border-l-4 border-indigo-500 slide-up">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                곡 수정
              </h3>
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
          <div className="glass-card rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
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
          <div className="glass-card rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
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
