/**
 * 악보 주석 관련 타입 정의
 */

// 주석 데이터 컨테이너
export interface AnnotationData {
  annotations: Annotation[];
}

// 주석 타입
export type Annotation = CircleAnnotation | ArrowAnnotation | LineAnnotation | TextAnnotation;

// 기본 주석 속성
export interface BaseAnnotation {
  page: number; // 페이지 번호 (1부터 시작)
  type: 'circle' | 'arrow' | 'line' | 'text';
  color: string; // hex color (예: "#FF0000")
  strokeWidth?: number; // 선 두께 (픽셀)
}

// 원형 주석
export interface CircleAnnotation extends BaseAnnotation {
  type: 'circle';
  x: number; // 0-1 정규화된 x 좌표
  y: number; // 0-1 정규화된 y 좌표
  radius: number; // 0-1 정규화된 반지름
}

// 화살표 주석
export interface ArrowAnnotation extends BaseAnnotation {
  type: 'arrow';
  x1: number; // 시작점 x (0-1 정규화)
  y1: number; // 시작점 y (0-1 정규화)
  x2: number; // 끝점 x (0-1 정규화)
  y2: number; // 끝점 y (0-1 정규화)
}

// 직선 주석
export interface LineAnnotation extends BaseAnnotation {
  type: 'line';
  x1: number; // 시작점 x (0-1 정규화)
  y1: number; // 시작점 y (0-1 정규화)
  x2: number; // 끝점 x (0-1 정규화)
  y2: number; // 끝점 y (0-1 정규화)
}

// 텍스트 주석
export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number; // 0-1 정규화된 x 좌표
  y: number; // 0-1 정규화된 y 좌표
  text: string; // 텍스트 내용
  fontSize: number; // 폰트 크기 (픽셀)
}

// 주석 저장 요청
export interface SaveAnnotationsRequest {
  annotations: Annotation[];
  version: number;
}
