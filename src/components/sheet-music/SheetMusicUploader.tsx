'use client';

import { useRef, useState } from 'react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export interface SheetMusicUploaderProps {
  songId: string;
  onUploadSuccess: (url: string, pageCount: number) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

interface UploadResponse {
  url?: string;
  path?: string;
  pageCount?: number;
  error?: string;
  type?: string;
}

export default function SheetMusicUploader({
  songId,
  onUploadSuccess,
  onUploadError,
  disabled = false,
}: SheetMusicUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('파일 크기는 최대 10MB까지 허용됩니다.');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('songId', songId);

      const response = await fetch('/api/upload/sheet-music', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '업로드에 실패했습니다.');
      }

      if (data.url && data.pageCount !== undefined) {
        onUploadSuccess(data.url, data.pageCount);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '업로드에 실패했습니다.';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 hover:border-white/30'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="space-y-3">
          <svg
            className="mx-auto h-12 w-12 text-white/40"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <title>파일 업로드</title>
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {file ? (
            <div className="text-sm">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-white/50">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="text-sm">
              <p className="text-white/70">
                <span className="font-semibold text-indigo-400">클릭</span>하거나 파일을{' '}
                <span className="font-semibold">드래그</span>하여 업로드
              </p>
              <p className="text-white/40 text-xs mt-1">PDF 파일만 가능 (최대 10MB, 20페이지)</p>
            </div>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} onRetry={() => setError('')} />
        </div>
      )}

      {/* 액션 버튼 */}
      {file && (
        <div className="mt-4 flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleRemoveFile}
            disabled={disabled || isUploading}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={disabled || isUploading}
          >
            업로드
          </Button>
        </div>
      )}
    </div>
  );
}
