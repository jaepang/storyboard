'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import Button from '@/components/common/Button';
import { formatBpmArray } from '@/lib/utils/format';
import type { ContiSong } from '@/types/song';

interface SongItemProps {
  song: ContiSong;
  onEdit: (song: ContiSong) => void;
  onDelete: (song: ContiSong) => void;
  onCopy: (song: ContiSong) => void;
  onUpload?: (song: ContiSong) => void;
  onEditSheetMusic?: (song: ContiSong) => void;
}

function SongItem({ song, onEdit, onDelete, onCopy, onUpload, onEditSheetMusic }: SongItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <button
          type="button"
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>곡 순서 변경</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{song.title}</h3>
            {song.sheet_music_url && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                악보 있음
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {song.composer && <span>작곡: {song.composer}</span>}
            {song.lyricist && <span>작사: {song.lyricist}</span>}
            {song.key_signature && <span>조성: {song.key_signature}</span>}
            {song.bpm_array && song.bpm_array.length > 0 && (
              <span>BPM: {formatBpmArray(song.bpm_array)}</span>
            )}
            {song.time_signature && <span>박자: {song.time_signature}</span>}
            {song.sheet_music_pages && <span>악보 페이지: {song.sheet_music_pages}p</span>}
          </div>
          {song.notes && <p className="mt-2 text-sm text-gray-500">{song.notes}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button size="small" variant="secondary" onClick={() => onCopy(song)}>
              복사
            </Button>
            <Button size="small" variant="secondary" onClick={() => onEdit(song)}>
              수정
            </Button>
            <Button size="small" variant="danger" onClick={() => onDelete(song)}>
              삭제
            </Button>
          </div>
          {/* Sheet Music Actions */}
          <div className="flex gap-2">
            {song.sheet_music_url
              ? onEditSheetMusic && (
                  <Button size="small" variant="secondary" onClick={() => onEditSheetMusic(song)}>
                    악보 편집
                  </Button>
                )
              : onUpload && (
                  <Button size="small" variant="primary" onClick={() => onUpload(song)}>
                    악보 업로드
                  </Button>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface SongListProps {
  songs: ContiSong[];
  onReorder: (newOrder: ContiSong[]) => Promise<void>;
  onEdit: (song: ContiSong) => void;
  onDelete: (song: ContiSong) => void;
  onCopy: (song: ContiSong) => void;
  onUpload?: (song: ContiSong) => void;
  onEditSheetMusic?: (song: ContiSong) => void;
  isLoading?: boolean;
}

export default function SongList({
  songs,
  onReorder,
  onEdit,
  onDelete,
  onCopy,
  onUpload,
  onEditSheetMusic,
  isLoading: _isLoading = false,
}: SongListProps) {
  const [items, setItems] = useState(songs);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        await onReorder(newItems);
      } catch (error) {
        // Revert on error
        setItems(items);
        console.error('Reorder failed:', error);
      }
    }
  };

  // Update local state when songs prop changes
  if (songs.length !== items.length || songs.some((song, i) => song.id !== items[i]?.id)) {
    setItems(songs);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>아직 추가된 곡이 없습니다.</p>
        <p className="text-sm mt-2">곡 추가 버튼을 클릭하여 곡을 추가하세요.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((song) => song.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopy={onCopy}
              onUpload={onUpload}
              onEditSheetMusic={onEditSheetMusic}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
