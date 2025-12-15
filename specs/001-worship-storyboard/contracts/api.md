# API 계약 명세: 찬양 콘티 관리 시스템

**작성일**: 2025-12-01
**기능**: [spec.md](../spec.md) | [data-model.md](../data-model.md)

## 개요

이 문서는 Next.js API Routes로 구현되는 REST API 엔드포인트를 정의합니다. 모든 엔드포인트는 JSON 형식으로 요청/응답하며, Supabase Auth 토큰을 통한 인증이 필요합니다.

**Base URL**: `http://localhost:3000` (개발), `https://[DOMAIN]` (프로덕션)

## 인증

모든 API 요청은 `Authorization` 헤더에 Supabase JWT 토큰을 포함해야 합니다.

```http
Authorization: Bearer [SUPABASE_JWT_TOKEN]
```

**인증 실패 응답**:
```json
{
  "error": "Unauthorized",
  "message": "인증이 필요합니다."
}
```
- **상태 코드**: `401 Unauthorized`

## 공통 응답 형식

### 성공 응답
```json
{
  "data": { /* 요청한 데이터 */ },
  "message": "성공 메시지 (선택적)"
}
```

### 에러 응답
```json
{
  "error": "ERROR_CODE",
  "message": "사용자 친화적 에러 메시지",
  "details": { /* 추가 디버깅 정보 (선택적) */ }
}
```

**공통 상태 코드**:
- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `204 No Content`: 성공 (응답 본문 없음, 삭제 시 사용)
- `400 Bad Request`: 잘못된 요청 (유효성 검증 실패)
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 낙관적 잠금 충돌
- `500 Internal Server Error`: 서버 에러

## API 엔드포인트

### 1. 콘티 관리 (`/api/conti`)

#### 1.1. 콘티 목록 조회

```http
GET /api/conti
```

**Query Parameters**:
- `limit` (선택적): 반환할 최대 개수 (기본값: 50, 최대: 100)
- `offset` (선택적): 페이지네이션 오프셋 (기본값: 0)
- `sort` (선택적): 정렬 기준 (`worship_date_desc` (기본값), `worship_date_asc`, `created_at_desc`, `title_asc`)

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "contis": [
      {
        "id": "uuid",
        "title": "2025년 1월 첫째 주 예배",
        "worship_date": "2025-01-05",
        "notes": "신년 특별 예배",
        "version": 1,
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-01T10:00:00Z",
        "song_count": 5
      }
    ],
    "total": 10,
    "limit": 50,
    "offset": 0
  }
}
```

**에러 응답**:
- `400`: 잘못된 쿼리 파라미터 (`limit` > 100 등)

#### 1.2. 단일 콘티 조회 (곡 목록 포함)

```http
GET /api/conti/[id]
```

**Path Parameters**:
- `id`: 콘티 UUID

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "id": "uuid",
    "title": "2025년 1월 첫째 주 예배",
    "worship_date": "2025-01-05",
    "notes": "신년 특별 예배",
    "version": 1,
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-01T10:00:00Z",
    "songs": [
      {
        "id": "uuid",
        "title": "주 은혜임을",
        "composer": "찬송가",
        "key_signature": "A",
        "bpm_array": [120, 140],
        "time_signature": "4/4",
        "sheet_music_url": "https://[STORAGE_URL]/...",
        "sheet_music_pages": 3,
        "annotations": { "annotations": [] },
        "order_index": 0,
        "notes": "후렴 2번 반복",
        "version": 1,
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-01T10:00:00Z"
      }
    ]
  }
}
```

**에러 응답**:
- `404`: 콘티를 찾을 수 없음
- `403`: 권한 없음 (다른 사용자의 콘티)

#### 1.3. 콘티 생성

```http
POST /api/conti
```

**Request Body**:
```json
{
  "title": "2025년 1월 둘째 주 예배",
  "worship_date": "2025-01-12",
  "notes": "선택적 메모"
}
```

**필수 필드**:
- `title` (string, 1자 이상)
- `worship_date` (string, ISO 8601 날짜 형식)

**선택적 필드**:
- `notes` (string)

**성공 응답** (`201 Created`):
```json
{
  "data": {
    "id": "uuid",
    "title": "2025년 1월 둘째 주 예배",
    "worship_date": "2025-01-12",
    "notes": null,
    "version": 1,
    "created_at": "2025-12-01T11:00:00Z",
    "updated_at": "2025-12-01T11:00:00Z"
  },
  "message": "콘티가 생성되었습니다."
}
```

**에러 응답**:
- `400`: 유효성 검증 실패 (제목 누락, 잘못된 날짜 형식 등)

#### 1.4. 콘티 수정

```http
PATCH /api/conti/[id]
```

**Path Parameters**:
- `id`: 콘티 UUID

**Request Body**:
```json
{
  "title": "수정된 제목",
  "worship_date": "2025-01-12",
  "notes": "수정된 메모",
  "version": 1
}
```

**필수 필드**:
- `version` (integer): 낙관적 잠금용 현재 버전

**선택적 필드** (수정할 필드만 포함):
- `title` (string)
- `worship_date` (string)
- `notes` (string)

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "id": "uuid",
    "title": "수정된 제목",
    "worship_date": "2025-01-12",
    "notes": "수정된 메모",
    "version": 2,
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-01T12:00:00Z"
  },
  "message": "콘티가 수정되었습니다."
}
```

**에러 응답**:
- `400`: 유효성 검증 실패
- `404`: 콘티를 찾을 수 없음
- `409`: 낙관적 잠금 충돌 (다른 사용자가 먼저 수정함)
  ```json
  {
    "error": "CONFLICT",
    "message": "다른 사용자가 이미 수정했습니다. 페이지를 새로고침하세요.",
    "details": {
      "current_version": 2,
      "provided_version": 1
    }
  }
  ```

#### 1.5. 콘티 삭제

```http
DELETE /api/conti/[id]
```

**Path Parameters**:
- `id`: 콘티 UUID

**성공 응답** (`204 No Content`):
- 응답 본문 없음

**에러 응답**:
- `404`: 콘티를 찾을 수 없음
- `403`: 권한 없음

### 2. 곡 관리 (`/api/conti/[conti_id]/song`)

#### 2.1. 콘티에 곡 추가 (새 곡 생성)

```http
POST /api/conti/[conti_id]/song
```

**Path Parameters**:
- `conti_id`: 콘티 UUID

**Request Body**:
```json
{
  "title": "주 은혜임을",
  "composer": "찬송가",
  "lyricist": "작사가",
  "key_signature": "A",
  "bpm_array": [120, 140],
  "time_signature": "4/4",
  "notes": "후렴 2번 반복",
  "order_index": 0
}
```

**필수 필드**:
- `title` (string, 1자 이상)

**선택적 필드**:
- `composer`, `lyricist`, `key_signature`, `time_signature`, `notes` (string)
- `bpm_array` (integer[], 기본값: `[]`)
- `order_index` (integer, 기본값: 콘티 내 마지막 순서)

**성공 응답** (`201 Created`):
```json
{
  "data": {
    "id": "uuid",
    "conti_id": "uuid",
    "song_id": null,
    "title": "주 은혜임을",
    "composer": "찬송가",
    "lyricist": "작사가",
    "key_signature": "A",
    "bpm_array": [120, 140],
    "time_signature": "4/4",
    "sheet_music_url": null,
    "sheet_music_pages": 1,
    "annotations": { "annotations": [] },
    "order_index": 0,
    "notes": "후렴 2번 반복",
    "version": 1,
    "created_at": "2025-12-01T13:00:00Z",
    "updated_at": "2025-12-01T13:00:00Z"
  },
  "message": "곡이 추가되었습니다."
}
```

**에러 응답**:
- `400`: 유효성 검증 실패
- `404`: 콘티를 찾을 수 없음

#### 2.2. 콘티에 곡 추가 (기존 곡 복사)

```http
POST /api/conti/[conti_id]/song/copy
```

**Path Parameters**:
- `conti_id`: 콘티 UUID

**Request Body**:
```json
{
  "song_id": "uuid",
  "order_index": 1
}
```

**필수 필드**:
- `song_id` (string, UUID): 복사할 원본 곡의 ID

**선택적 필드**:
- `order_index` (integer)

**동작**:
- `songs` 테이블에서 곡 정보를 조회하여 `conti_songs`에 복사
- 악보 및 주석은 복사되지 않음 (새로 업로드 필요)

**성공 응답** (`201 Created`):
```json
{
  "data": {
    "id": "new-uuid",
    "conti_id": "uuid",
    "song_id": "uuid",
    "title": "이 땅에 평화",
    "composer": "나얼",
    "key_signature": "C",
    "bpm_array": [],
    "time_signature": "4/4",
    "sheet_music_url": null,
    "sheet_music_pages": 1,
    "annotations": { "annotations": [] },
    "order_index": 1,
    "notes": null,
    "version": 1,
    "created_at": "2025-12-01T13:10:00Z",
    "updated_at": "2025-12-01T13:10:00Z"
  },
  "message": "곡이 복사되었습니다."
}
```

**에러 응답**:
- `400`: `song_id` 누락
- `404`: 원본 곡 또는 콘티를 찾을 수 없음

#### 2.3. 곡 정보 수정

```http
PATCH /api/conti/[conti_id]/song/[song_id]
```

**Path Parameters**:
- `conti_id`: 콘티 UUID
- `song_id`: 곡 UUID

**Request Body**:
```json
{
  "title": "수정된 제목",
  "key_signature": "D",
  "bpm_array": [130, 150],
  "notes": "수정된 메모",
  "version": 1
}
```

**필수 필드**:
- `version` (integer): 낙관적 잠금용 현재 버전

**선택적 필드** (수정할 필드만 포함):
- `title`, `composer`, `lyricist`, `key_signature`, `time_signature`, `notes` (string)
- `bpm_array` (integer[])
- `order_index` (integer)

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "id": "uuid",
    "title": "수정된 제목",
    "key_signature": "D",
    "bpm_array": [130, 150],
    "notes": "수정된 메모",
    "version": 2,
    "updated_at": "2025-12-01T14:00:00Z"
  },
  "message": "곡 정보가 수정되었습니다."
}
```

**에러 응답**:
- `400`: 유효성 검증 실패
- `404`: 곡 또는 콘티를 찾을 수 없음
- `409`: 낙관적 잠금 충돌

#### 2.4. 곡 순서 변경 (일괄)

```http
PUT /api/conti/[conti_id]/song/reorder
```

**Path Parameters**:
- `conti_id`: 콘티 UUID

**Request Body**:
```json
{
  "song_orders": [
    { "id": "song-uuid-1", "order_index": 2 },
    { "id": "song-uuid-2", "order_index": 0 },
    { "id": "song-uuid-3", "order_index": 1 }
  ]
}
```

**필수 필드**:
- `song_orders` (array): 각 곡의 ID와 새 순서

**성공 응답** (`200 OK`):
```json
{
  "message": "곡 순서가 변경되었습니다."
}
```

**에러 응답**:
- `400`: 잘못된 형식 또는 중복된 `order_index`
- `404`: 일부 곡을 찾을 수 없음

#### 2.5. 곡 삭제

```http
DELETE /api/conti/[conti_id]/song/[song_id]
```

**Path Parameters**:
- `conti_id`: 콘티 UUID
- `song_id`: 곡 UUID

**성공 응답** (`204 No Content`):
- 응답 본문 없음

**에러 응답**:
- `404`: 곡 또는 콘티를 찾을 수 없음

### 3. 악보 업로드 (`/api/upload/sheet-music`)

#### 3.1. 악보 파일 업로드

```http
POST /api/upload/sheet-music
```

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: PDF 파일 (최대 10MB, 최대 20페이지)
- `conti_id`: 콘티 UUID (string)
- `song_id`: 곡 UUID (string)

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "url": "https://[SUPABASE_STORAGE]/sheet-music/[conti_id]/[song_id]/filename.pdf",
    "pages": 3,
    "file_size": 2048576
  },
  "message": "악보가 업로드되었습니다."
}
```

**에러 응답**:
- `400`: 파일 형식 오류 (PDF가 아님), 크기 초과 (>10MB), 페이지 수 초과 (>20)
  ```json
  {
    "error": "INVALID_FILE",
    "message": "악보는 최대 20페이지, 10MB 이하의 PDF 파일이어야 합니다.",
    "details": {
      "file_size": 11534336,
      "max_size": 10485760
    }
  }
  ```
- `404`: 콘티 또는 곡을 찾을 수 없음

**구현 참고**:
- 업로드 후 `conti_songs` 테이블의 `sheet_music_url`, `sheet_music_pages` 자동 업데이트
- 기존 악보가 있으면 덮어쓰기 (이전 파일 삭제)

### 4. 주석 관리 (`/api/conti/[conti_id]/song/[song_id]/annotations`)

#### 4.1. 주석 저장

```http
PUT /api/conti/[conti_id]/song/[song_id]/annotations
```

**Path Parameters**:
- `conti_id`: 콘티 UUID
- `song_id`: 곡 UUID

**Request Body**:
```json
{
  "annotations": [
    {
      "page": 1,
      "type": "circle",
      "x": 0.5,
      "y": 0.3,
      "radius": 0.05,
      "color": "#FF0000",
      "strokeWidth": 2
    },
    {
      "page": 1,
      "type": "arrow",
      "x1": 0.2,
      "y1": 0.1,
      "x2": 0.4,
      "y2": 0.5,
      "color": "#0000FF",
      "strokeWidth": 3
    }
  ],
  "version": 1
}
```

**필수 필드**:
- `annotations` (array): 주석 데이터 배열 (JSONB 형식)
- `version` (integer): 낙관적 잠금용 현재 버전

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "annotations": [ /* 저장된 주석 데이터 */ ],
    "version": 2
  },
  "message": "주석이 저장되었습니다."
}
```

**에러 응답**:
- `400`: 유효성 검증 실패 (잘못된 주석 형식)
- `404`: 곡 또는 콘티를 찾을 수 없음
- `409`: 낙관적 잠금 충돌

#### 4.2. 주석 조회

```http
GET /api/conti/[conti_id]/song/[song_id]/annotations
```

**Path Parameters**:
- `conti_id`: 콘티 UUID
- `song_id`: 곡 UUID

**성공 응답** (`200 OK`):
```json
{
  "data": {
    "annotations": [ /* 주석 데이터 */ ],
    "version": 2
  }
}
```

**에러 응답**:
- `404`: 곡 또는 콘티를 찾을 수 없음

### 5. PDF 생성 (`/api/pdf`)

#### 5.1. 콘티 PDF 다운로드

```http
GET /api/pdf/[conti_id]
```

**Path Parameters**:
- `conti_id`: 콘티 UUID

**Query Parameters**:
- `include_annotations` (선택적): 주석 포함 여부 (기본값: `true`)

**성공 응답** (`200 OK`):
- **Content-Type**: `application/pdf`
- **Headers**: `Content-Disposition: attachment; filename="conti-[title]-[date].pdf"`
- **Body**: PDF 바이너리 데이터

**PDF 내용**:
1. **첫 페이지 (콘티 정보)**:
   - 콘티 제목
   - 예배 날짜
   - 곡 목록 (순서, 제목, 작곡가, 조성, BPM 배열)
   - 메모 (있는 경우)

2. **이후 페이지 (각 곡의 악보)**:
   - 악보 이미지 (페이지별)
   - 주석 오버레이 (선택 시)
   - 곡별 메모 (있는 경우)

**에러 응답**:
- `404`: 콘티를 찾을 수 없음
- `500`: PDF 생성 실패
  ```json
  {
    "error": "PDF_GENERATION_FAILED",
    "message": "PDF 생성 중 오류가 발생했습니다.",
    "details": {
      "reason": "악보 파일을 찾을 수 없습니다."
    }
  }
  ```

**성능 목표**: 1-4초 이내 응답

## 타입 정의 (TypeScript)

### Request/Response 타입

```typescript
// src/types/api.ts

// 콘티 타입
export interface Conti {
  id: string;
  title: string;
  worship_date: string; // ISO 8601 날짜
  notes: string | null;
  version: number;
  created_at: string; // ISO 8601 타임스탬프
  updated_at: string;
}

export interface ContiWithSongs extends Conti {
  songs: ContiSong[];
}

export interface ContiListItem extends Conti {
  song_count: number;
}

// 곡 타입
export interface ContiSong {
  id: string;
  conti_id: string;
  song_id: string | null;
  title: string;
  composer: string | null;
  lyricist: string | null;
  key_signature: string | null;
  bpm_array: number[];
  time_signature: string;
  sheet_music_url: string | null;
  sheet_music_pages: number;
  annotations: AnnotationData;
  order_index: number;
  notes: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

// 주석 타입
export interface AnnotationData {
  annotations: Annotation[];
}

export type Annotation =
  | CircleAnnotation
  | ArrowAnnotation
  | LineAnnotation
  | TextAnnotation;

export interface BaseAnnotation {
  page: number;
  type: 'circle' | 'arrow' | 'line' | 'text';
  color: string; // hex color
  strokeWidth?: number;
}

export interface CircleAnnotation extends BaseAnnotation {
  type: 'circle';
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  radius: number; // 0-1 normalized
}

export interface ArrowAnnotation extends BaseAnnotation {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LineAnnotation extends BaseAnnotation {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// 요청 타입
export interface CreateContiRequest {
  title: string;
  worship_date: string;
  notes?: string;
}

export interface UpdateContiRequest {
  title?: string;
  worship_date?: string;
  notes?: string;
  version: number;
}

export interface CreateSongRequest {
  title: string;
  composer?: string;
  lyricist?: string;
  key_signature?: string;
  bpm_array?: number[];
  time_signature?: string;
  notes?: string;
  order_index?: number;
}

export interface UpdateSongRequest {
  title?: string;
  composer?: string;
  lyricist?: string;
  key_signature?: string;
  bpm_array?: number[];
  time_signature?: string;
  notes?: string;
  order_index?: number;
  version: number;
}

export interface CopySongRequest {
  song_id: string;
  order_index?: number;
}

export interface ReorderSongsRequest {
  song_orders: Array<{
    id: string;
    order_index: number;
  }>;
}

export interface SaveAnnotationsRequest {
  annotations: Annotation[];
  version: number;
}
```

## 에러 코드 참조

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| `UNAUTHORIZED` | 인증 실패 | 401 |
| `FORBIDDEN` | 권한 부족 | 403 |
| `NOT_FOUND` | 리소스 없음 | 404 |
| `CONFLICT` | 낙관적 잠금 충돌 | 409 |
| `VALIDATION_ERROR` | 유효성 검증 실패 | 400 |
| `INVALID_FILE` | 잘못된 파일 형식/크기 | 400 |
| `PDF_GENERATION_FAILED` | PDF 생성 실패 | 500 |
| `INTERNAL_ERROR` | 서버 내부 오류 | 500 |

## 보안 고려사항

### 1. 입력 유효성 검증
- 모든 사용자 입력을 서버 측에서 검증
- 문자열 길이 제한 (제목 최대 255자 등)
- SQL Injection 방지 (Supabase 클라이언트가 자동 처리)
- XSS 방지 (HTML 이스케이프)

### 2. 파일 업로드 보안
- 파일 타입 검증 (MIME 타입 + Magic Number)
- 파일 크기 제한 (10MB)
- 파일명 sanitization (특수문자 제거)
- 바이러스 스캔 (Phase 2 이후 고려)

### 3. Rate Limiting
- API 호출 제한 (예: 분당 100회)
- PDF 생성 제한 (예: 분당 10회)

### 4. CORS 설정
- 프로덕션 환경에서 특정 도메인만 허용
- 개발 환경에서는 `localhost` 허용

## 성능 최적화

### 1. 캐싱 전략
- PDF 생성 결과 캐싱 (콘티 버전 기반)
- Supabase Storage CDN 활용

### 2. 데이터베이스 쿼리 최적화
- N+1 쿼리 방지 (곡 목록 조회 시 JOIN 사용)
- 인덱스 활용 (외래 키, 날짜 컬럼)

### 3. 페이지네이션
- 콘티 목록 조회 시 `limit`/`offset` 파라미터 활용
- 무한 스크롤 또는 페이지 번호 UI

## 테스트 전략

### 1. 단위 테스트
- 각 API 엔드포인트 개별 테스트
- 유효성 검증 로직 테스트
- 낙관적 잠금 동작 테스트

### 2. 통합 테스트
- Supabase 연동 테스트 (테스트 DB 사용)
- PDF 생성 테스트 (샘플 데이터)
- 파일 업로드 테스트 (Supabase Storage)

### 3. E2E 테스트 (Phase 2 이후)
- 실제 브라우저에서 전체 플로우 테스트
- Playwright 또는 Cypress 사용

## 향후 확장 고려사항

### Phase 2 이후 추가 가능한 엔드포인트

1. **곡 검색**:
   ```http
   GET /api/songs/search?q=검색어&limit=20
   ```

2. **콘티 복사**:
   ```http
   POST /api/conti/[id]/duplicate
   ```

3. **콘티 공유**:
   ```http
   POST /api/conti/[id]/share
   ```

4. **버전 히스토리**:
   ```http
   GET /api/conti/[id]/versions
   POST /api/conti/[id]/restore/[version_id]
   ```

---

**다음 단계**: `quickstart.md` 파일에서 개발 환경 설정 및 실행 가이드를 작성합니다.
