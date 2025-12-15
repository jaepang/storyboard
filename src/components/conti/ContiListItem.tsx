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
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 truncate">{conti.title}</h3>

          {/* Worship Date */}
          <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Calendar</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(conti.worship_date)}</span>
          </div>

          {/* Song Count */}
          <div className="flex items-center gap-2 text-sm text-white/50">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Music</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>곡 {conti.song_count}개</span>
          </div>

          {/* Notes Preview */}
          {conti.notes && <p className="mt-3 text-sm text-white/60 line-clamp-2">{conti.notes}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="small" onClick={handleEdit} disabled={isDeleting}>
            편집
          </Button>
          {onDelete && (
            <Button variant="danger" size="small" onClick={handleDelete} isLoading={isDeleting}>
              삭제
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
        <span>생성일: {new Date(conti.created_at).toLocaleDateString('ko-KR')}</span>
        {conti.updated_at !== conti.created_at && (
          <span>수정일: {new Date(conti.updated_at).toLocaleDateString('ko-KR')}</span>
        )}
      </div>
    </div>
  );
}
