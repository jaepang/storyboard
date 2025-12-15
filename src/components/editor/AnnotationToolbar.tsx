'use client';

import Button from '@/components/common/Button';

interface AnnotationToolbarProps {
  isDrawing: boolean;
  color: string;
  strokeWidth: number;
  onToggleDrawing: () => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
  onSave: () => void;
}

/**
 * 주석 작성 도구 모음
 * 색상, 두께 선택 및 드로잉 모드 토글
 */
export default function AnnotationToolbar({
  isDrawing,
  color,
  strokeWidth,
  onToggleDrawing,
  onColorChange,
  onStrokeWidthChange,
  onClear,
  onSave,
}: AnnotationToolbarProps) {
  const colors = [
    { name: '검정', value: '#000000' },
    { name: '빨강', value: '#FF0000' },
    { name: '파랑', value: '#0000FF' },
    { name: '초록', value: '#00FF00' },
    { name: '주황', value: '#FFA500' },
  ];

  const strokeWidths = [
    { name: '가늘게', value: 2 },
    { name: '보통', value: 4 },
    { name: '두껍게', value: 6 },
    { name: '매우 두껍게', value: 10 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg">
      {/* 드로잉 모드 토글 */}
      <div>
        <Button
          type="button"
          variant={isDrawing ? 'primary' : 'secondary'}
          onClick={onToggleDrawing}
        >
          {isDrawing ? '드로잉 중' : '드로잉 시작'}
        </Button>
      </div>

      {/* 색상 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                color === c.value ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c.value }}
              onClick={() => onColorChange(c.value)}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* 두께 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          두께: {strokeWidth}px
        </label>
        <div className="flex gap-2">
          {strokeWidths.map((w) => (
            <Button
              key={w.value}
              type="button"
              variant={strokeWidth === w.value ? 'primary' : 'secondary'}
              onClick={() => onStrokeWidthChange(w.value)}
            >
              {w.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 작업 버튼 */}
      <div className="flex gap-2">
        <Button type="button" variant="danger" onClick={onClear} disabled={!isDrawing}>
          모두 지우기
        </Button>
        <Button type="button" variant="primary" onClick={onSave}>
          저장
        </Button>
      </div>
    </div>
  );
}
