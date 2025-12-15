/**
 * 악보 주석 관련 타입 정의 (Canvas 기반 벡터 드로잉)
 */

// 주석 데이터 컨테이너 (전체 주석 데이터)
export interface AnnotationData {
  annotations: Stroke[];
}

// 편의를 위한 Annotation 타입 별칭
export type Annotation = AnnotationData;

// 좌표 포인트
export interface Point {
  x: number;
  y: number;
}

// 스트로크 (단일 그리기 작업)
export interface Stroke {
  id: string;
  pageIndex: number; // 페이지 번호 (0부터 시작)
  color: string; // hex color (예: "#000000")
  strokeWidth: number; // 선 두께 (픽셀)
  points: Point[]; // 스트로크의 포인트 배열
}

// 주석 저장 요청 (API용)
export interface SaveAnnotationsRequest {
  annotations: Stroke[];
  version?: number;
}
