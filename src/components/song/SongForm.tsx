'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import type { ContiSong, CreateSongRequest, UpdateSongRequest } from '@/types/song';

export type SongFormData = CreateSongRequest | UpdateSongRequest;

export interface SongFormProps {
  initialData?: ContiSong;
  onSubmit: (data: SongFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function SongForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SongFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [composer, setComposer] = useState(initialData?.composer || '');
  const [lyricist, setLyricist] = useState(initialData?.lyricist || '');
  const [keySignature, setKeySignature] = useState(initialData?.key_signature || '');
  const [bpmInput, setBpmInput] = useState(initialData?.bpm_array?.join(', ') || '');
  const [timeSignature, setTimeSignature] = useState(initialData?.time_signature || '4/4');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!initialData;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '곡 제목을 입력하세요.';
    }

    if (!isEditMode && !bpmInput.trim()) {
      newErrors.bpm = 'BPM을 입력하세요.';
    }

    if (bpmInput.trim()) {
      const bpmArray = bpmInput
        .split(',')
        .map((b) => b.trim())
        .filter((b) => b);

      if (bpmArray.some((b) => Number.isNaN(Number(b)) || Number(b) <= 0)) {
        newErrors.bpm = 'BPM은 양수만 입력 가능합니다. (예: 120, 140, 100)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const bpmArray = bpmInput
        .split(',')
        .map((b) => Number(b.trim()))
        .filter((b) => !Number.isNaN(b) && b > 0);

      if (isEditMode) {
        await onSubmit({
          title: title.trim(),
          composer: composer.trim() || undefined,
          lyricist: lyricist.trim() || undefined,
          key_signature: keySignature.trim() || undefined,
          bpm_array: bpmArray.length > 0 ? bpmArray : undefined,
          time_signature: timeSignature || undefined,
          notes: notes.trim() || undefined,
          version: initialData.version,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          composer: composer.trim() || undefined,
          lyricist: lyricist.trim() || undefined,
          key_signature: keySignature.trim() || undefined,
          bpm_array: bpmArray,
          time_signature: timeSignature || undefined,
          notes: notes.trim() || undefined,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="곡 제목"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="예: 주 안에 있는 나에게"
        required
        disabled={isLoading}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="작곡가"
          type="text"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          placeholder="선택사항"
          disabled={isLoading}
        />

        <Input
          label="작사가"
          type="text"
          value={lyricist}
          onChange={(e) => setLyricist(e.target.value)}
          placeholder="선택사항"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="조성"
          type="text"
          value={keySignature}
          onChange={(e) => setKeySignature(e.target.value)}
          placeholder="예: C, G, Dm"
          disabled={isLoading}
        />

        <Input
          label="BPM"
          type="text"
          value={bpmInput}
          onChange={(e) => setBpmInput(e.target.value)}
          error={errors.bpm}
          placeholder="120, 140, 100"
          helperText="쉼표로 구분"
          required={!isEditMode}
          disabled={isLoading}
        />

        <Input
          label="박자"
          type="text"
          value={timeSignature}
          onChange={(e) => setTimeSignature(e.target.value)}
          placeholder="4/4"
          disabled={isLoading}
        />
      </div>

      <div className="w-full">
        <label htmlFor="song-notes" className="block text-sm font-medium text-gray-700 mb-1">
          곡 메모 (선택사항)
        </label>
        <textarea
          id="song-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="예: 후렴 2번 반복"
          disabled={isLoading}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditMode ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
