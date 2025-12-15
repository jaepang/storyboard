'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Annotation, Stroke } from '@/types/annotation';

interface AnnotationCanvasProps {
  pageIndex: number;
  annotations: Annotation | null;
  color: string;
  strokeWidth: number;
  isDrawing: boolean;
  onAnnotationsChange: (annotations: Annotation) => void;
}

/**
 * Canvas 기반 주석 작성 컴포넌트
 * 실시간 벡터 드로잉 지원 (<50ms 지연)
 */
export default function AnnotationCanvas({
  pageIndex,
  annotations,
  color,
  strokeWidth,
  isDrawing,
  onAnnotationsChange,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 스트로크 렌더링
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  // 캔버스 초기화 및 기존 주석 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 기존 주석 렌더링
    if (annotations?.annotations) {
      for (const stroke of annotations.annotations) {
        drawStroke(ctx, stroke);
      }
    }
  }, [annotations, drawStroke]);

  // 마우스 다운 이벤트
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsMouseDown(true);
    setCurrentStroke({
      id: `stroke-${Date.now()}-${Math.random()}`,
      pageIndex,
      color,
      strokeWidth,
      points: [{ x, y }],
    });
  };

  // 마우스 무브 이벤트
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMouseDown || !currentStroke) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 현재 스트로크에 포인트 추가
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, { x, y }],
    };

    setCurrentStroke(updatedStroke);

    // 실시간 렌더링 (< 50ms)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawStroke(ctx, updatedStroke);
    }
  };

  // 마우스 업 이벤트
  const handleMouseUp = () => {
    if (!isDrawing || !isMouseDown || !currentStroke) return;

    setIsMouseDown(false);

    // 주석 데이터에 추가
    const existingAnnotations = annotations?.annotations || [];
    const updatedAnnotations: Annotation = {
      annotations: [...existingAnnotations, currentStroke],
    };

    onAnnotationsChange(updatedAnnotations);
    setCurrentStroke(null);
  };

  // 마우스 리브 이벤트 (캔버스 밖으로 나가면 드로잉 종료)
  const handleMouseLeave = () => {
    if (isMouseDown) {
      handleMouseUp();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={1000}
      className={`border border-gray-300 ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}
