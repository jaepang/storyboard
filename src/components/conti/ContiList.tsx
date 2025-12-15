'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';
import type { ContiListItem } from '@/types/conti';
import ContiListItemComponent from './ContiListItem';

export interface ContiListProps {
  contis: ContiListItem[];
  total: number;
  limit: number;
  offset: number;
  isLoading?: boolean;
  error?: string | null;
  onPageChange: (offset: number) => void;
  onDelete?: (id: string) => Promise<void>;
  onRetry?: () => void;
}

export default function ContiList({
  contis,
  total,
  limit,
  offset,
  isLoading = false,
  error = null,
  onPageChange,
  onDelete,
  onRetry,
}: ContiListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreviousPage = () => {
    if (offset > 0) {
      onPageChange(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      onPageChange(offset + limit);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <ErrorMessage title="콘티 목록 조회 실패" message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (isLoading && contis.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 flex items-center justify-center">
        <Loading size="large" text="콘티 목록을 불러오는 중..." />
      </div>
    );
  }

  if (contis.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>No contis</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">콘티가 없습니다</h3>
        <p className="text-gray-600 mb-4">새로운 콘티를 생성해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          전체 {total}개 중 {offset + 1}-{Math.min(offset + limit, total)}번째 콘티
        </span>
        {isLoading && <Loading size="small" text="불러오는 중..." />}
      </div>

      {/* Conti List */}
      <div className="grid grid-cols-1 gap-4">
        {contis.map((conti) => (
          <ContiListItemComponent
            key={conti.id}
            conti={conti}
            onDelete={onDelete ? handleDelete : undefined}
            isDeleting={deletingId === conti.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            페이지 {currentPage} / {totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handlePreviousPage}
              disabled={offset === 0 || isLoading}
            >
              이전
            </Button>
            <Button
              variant="secondary"
              onClick={handleNextPage}
              disabled={offset + limit >= total || isLoading}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
