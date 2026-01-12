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
      <div className="glass-card rounded-2xl p-6">
        <ErrorMessage title="콘티 목록 조회 실패" message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (isLoading && contis.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center">
        <Loading size="large" text="콘티 목록을 불러오는 중..." />
      </div>
    );
  }

  if (contis.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-8 w-8 text-indigo-500"
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
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">콘티가 없습니다</h3>
        <p className="text-gray-600">새로운 콘티를 생성해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-white/80 font-medium">
          전체 {total}개 중 {offset + 1}-{Math.min(offset + limit, total)}번째
        </span>
        {isLoading && <Loading size="small" text="불러오는 중..." light />}
      </div>

      {/* Conti List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {contis.map((conti, index) => (
          <div
            key={conti.id}
            className="fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ContiListItemComponent
              conti={conti}
              onDelete={onDelete ? handleDelete : undefined}
              isDeleting={deletingId === conti.id}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-700 font-medium">
            페이지 {currentPage} / {totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={handlePreviousPage}
              disabled={offset === 0 || isLoading}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              이전
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleNextPage}
              disabled={offset + limit >= total || isLoading}
            >
              다음
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
