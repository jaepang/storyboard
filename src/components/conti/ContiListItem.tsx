'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import type { ContiListItem } from '@/types/conti';

export interface ContiListItemProps {
  conti: ContiListItem;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export default function ContiListItemComponent({
  conti,
  onDelete,
  isDeleting = false,
}: ContiListItemProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/conti/${conti.id}`);
  };

  const handleDelete = () => {
    if (onDelete && confirm(`"${conti.title}" 콘티를 삭제하시겠습니까?`)) {
      onDelete(conti.id);
    }
  };

  // Format date to Korean format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
      <div className="flex-1">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 truncate group-hover:text-indigo-600 transition-colors">
          {conti.title}
        </h3>

        {/* Worship Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Calendar</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="font-medium">{formatDate(conti.worship_date)}</span>
        </div>

        {/* Song Count */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Music</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <span>곡 {conti.song_count}개</span>
        </div>

        {/* Notes Preview */}
        {conti.notes && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{conti.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100/50">
        <Button variant="primary" size="small" onClick={handleEdit} disabled={isDeleting} className="flex-1">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          편집
        </Button>
        {onDelete && (
          <Button variant="danger" size="small" onClick={handleDelete} isLoading={isDeleting}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{new Date(conti.created_at).toLocaleDateString('ko-KR')}</span>
        {conti.updated_at !== conti.created_at && (
          <span className="text-indigo-400">수정됨</span>
        )}
      </div>
    </div>
  );
}
