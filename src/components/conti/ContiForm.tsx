'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import type { Conti, CreateContiRequest, UpdateContiRequest } from '@/types/conti';

export type ContiFormData = CreateContiRequest | UpdateContiRequest;

export interface ContiFormProps {
  initialData?: Conti;
  onSubmit: (data: ContiFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ContiForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContiFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [worshipDate, setWorshipDate] = useState(initialData?.worship_date || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!initialData;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '제목을 입력하세요.';
    }

    if (!worshipDate) {
      newErrors.worshipDate = '예배 날짜를 선택하세요.';
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
      if (isEditMode) {
        await onSubmit({
          title: title.trim(),
          worship_date: worshipDate,
          notes: notes.trim() || undefined,
          version: initialData.version,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          worship_date: worshipDate,
          notes: notes.trim() || undefined,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="콘티 제목"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="예: 2025년 1월 첫째 주 예배"
        required
        disabled={isLoading}
      />

      <Input
        label="예배 날짜"
        type="date"
        value={worshipDate}
        onChange={(e) => setWorshipDate(e.target.value)}
        error={errors.worshipDate}
        required
        disabled={isLoading}
      />

      <div className="w-full">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          메모 (선택사항)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="콘티 전체에 대한 메모를 입력하세요..."
          disabled={isLoading}
          rows={4}
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
          {isEditMode ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}
