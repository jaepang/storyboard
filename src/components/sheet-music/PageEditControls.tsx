'use client';

import Button from '@/components/common/Button';

/**
 * PageEditControls 컴포넌트
 *
 * 악보 페이지의 개별 편집 컨트롤을 제공합니다.
 *
 * 기능:
 * - 페이지 크기 조절 (Scale)
 * - 페이지 회전 (Rotation)
 * - 자르기 영역 설정 (Crop Area)
 * - 페이지 삭제
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageEditControlsProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  cropArea?: CropArea;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onCropAreaChange?: (cropArea: CropArea | undefined) => void;
  onPageDelete?: () => void;
  disabled?: boolean;
}

export default function PageEditControls({
  pageNumber,
  scale,
  rotation,
  cropArea,
  onScaleChange,
  onRotationChange,
  onCropAreaChange,
  onPageDelete,
  disabled = false,
}: PageEditControlsProps) {
  const handleScaleIncrease = () => {
    const newScale = Math.min(2.0, scale + 0.1);
    onScaleChange(Number(newScale.toFixed(1)));
  };

  const handleScaleDecrease = () => {
    const newScale = Math.max(0.5, scale - 0.1);
    onScaleChange(Number(newScale.toFixed(1)));
  };

  const handleRotateLeft = () => {
    onRotationChange((rotation - 90) % 360);
  };

  const handleRotateRight = () => {
    onRotationChange((rotation + 90) % 360);
  };

  const handleResetScale = () => {
    onScaleChange(1.0);
  };

  const handleResetRotation = () => {
    onRotationChange(0);
  };

  const handleResetCrop = () => {
    onCropAreaChange?.(undefined);
  };

  const handleResetAll = () => {
    onScaleChange(1.0);
    onRotationChange(0);
    onCropAreaChange?.(undefined);
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">페이지 {pageNumber} 편집</h4>
        {onPageDelete && (
          <Button type="button" variant="danger" onClick={onPageDelete} disabled={disabled}>
            삭제
          </Button>
        )}
      </div>

      {/* 크기 조절 */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          크기: {(scale * 100).toFixed(0)}%
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleScaleDecrease}
            disabled={disabled || scale <= 0.5}
          >
            -
          </Button>
          <div className="flex-1">
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={scale * 100}
              onChange={(e) => onScaleChange(Number(e.target.value) / 100)}
              disabled={disabled}
              className="w-full"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleScaleIncrease}
            disabled={disabled || scale >= 2.0}
          >
            +
          </Button>
          <Button type="button" variant="secondary" onClick={handleResetScale} disabled={disabled}>
            초기화
          </Button>
        </div>
      </div>

      {/* 회전 */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">회전: {rotation}°</label>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={handleRotateLeft} disabled={disabled}>
            ↶ 왼쪽 90°
          </Button>
          <Button type="button" variant="secondary" onClick={handleRotateRight} disabled={disabled}>
            ↷ 오른쪽 90°
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetRotation}
            disabled={disabled}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* 자르기 영역 */}
      {onCropAreaChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-700">자르기 영역</label>
            {cropArea && (
              <button
                type="button"
                onClick={handleResetCrop}
                disabled={disabled}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
              >
                초기화
              </button>
            )}
          </div>
          {cropArea ? (
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                X: {cropArea.x}px, Y: {cropArea.y}px
              </p>
              <p>
                크기: {cropArea.width}px × {cropArea.height}px
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">자르기 영역이 설정되지 않았습니다.</p>
          )}
        </div>
      )}

      {/* 전체 초기화 */}
      <div className="pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={handleResetAll} disabled={disabled}>
          모든 설정 초기화
        </Button>
      </div>
    </div>
  );
}
