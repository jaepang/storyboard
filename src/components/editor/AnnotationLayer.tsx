'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Annotation, Stroke } from '@/types/annotation';

interface AnnotationLayerProps {
  pageIndex: number;
  annotations: Annotation | null;
  width?: number;
  height?: number;
}

/**
 * 저장된 주석을 표시하는 읽기 전용 레이어
 * PDF 미리보기나 조회 화면에서 사용
 */
export default function AnnotationLayer({
  pageIndex,
  annotations,
  width = 800,
  height = 1000,
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 해당 페이지의 주석만 필터링하여 렌더링
    const pageAnnotations = annotations?.annotations.filter(
      (stroke) => stroke.pageIndex === pageIndex
    );

    if (pageAnnotations && pageAnnotations.length > 0) {
      for (const stroke of pageAnnotations) {
        drawStroke(ctx, stroke);
      }
    }
  }, [annotations, pageIndex, drawStroke]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
}
