# 기술 조사 및 선택 근거: 찬양 콘티 관리 시스템

**작성일**: 2025-12-01
**기능**: [spec.md](./spec.md) | [plan.md](./plan.md)

## 개요

이 문서는 찬양 콘티 관리 시스템 구현을 위한 기술 스택 선택 근거와 주요 구현 전략을 담고 있습니다. 모든 기술 선택은 `.specify/memory/constitution.md`의 원칙(코드 퀄리티, 실용주의, KISS)을 따릅니다.

## 기술 스택 선택 근거

### 1. Next.js 15 (App Router)

**선택 이유**:
- **풀스택 통합**: API 라우트와 프론트엔드를 단일 프로젝트에서 관리하여 개발/배포 단순화
- **React Server Components**: 서버 측 렌더링으로 초기 로딩 성능 향상
- **파일 기반 라우팅**: 직관적인 페이지 구조 (`app/conti/[id]/page.tsx`)
- **최신 React 19 지원**: Concurrent Features, Transitions 등 활용
- **빌트인 최적화**: 이미지 최적화, 폰트 최적화, 코드 스플리팅 자동 처리

**대안 비교**:
- **Create React App**: 프론트엔드만 지원, API 별도 프로젝트 필요 → 복잡도 증가
- **Express + React**: 설정이 복잡하고 보일러플레이트 많음 → KISS 원칙 위배
- **Remix**: Next.js보다 생태계가 작고 성숙도 낮음

**Best Practices**:
- App Router 사용 (Pages Router는 레거시)
- Server Components를 기본으로, 클라이언트 인터랙션이 필요한 곳만 `'use client'`
- API 라우트는 `app/api/` 디렉토리에 배치
- 환경 변수는 `NEXT_PUBLIC_` 접두사로 클라이언트 노출 여부 제어

### 2. TypeScript 5.x

**선택 이유**:
- **타입 안정성**: 컴파일 타임에 버그 발견, 런타임 에러 감소
- **코드 가독성**: 명시적 타입으로 코드 의도 명확화 → 코드 퀄리티 원칙 준수
- **IDE 지원**: 자동완성, 리팩토링 도구 활용 → 개발 생산성 향상
- **Next.js 공식 지원**: 설정 없이 바로 사용 가능

**Best Practices**:
- `strict: true` 모드 사용 (타입 체크 엄격화)
- `src/types/` 디렉토리에 도메인별 타입 정의 (`conti.ts`, `song.ts`, `database.ts`)
- API 응답/요청에 대한 타입 정의 필수
- `unknown` 사용 권장, `any` 최소화

### 3. Supabase (PostgreSQL + Storage)

**선택 이유**:
- **관리형 PostgreSQL**: 인프라 관리 부담 없이 관계형 DB 사용
- **통합 스토리지**: 악보 파일 업로드를 위한 오브젝트 스토리지 내장
- **실시간 구독**: 동시 편집 감지를 위한 Realtime 기능 (Phase 2 이후 활용 가능)
- **Row Level Security**: 인증/권한 관리를 DB 레벨에서 처리
- **TypeScript SDK**: 타입 안전한 클라이언트 제공

**대안 비교**:
- **Firebase**: NoSQL이라 복잡한 관계 쿼리 어려움, 콘티-곡 관계 표현에 부적합
- **MongoDB + AWS S3**: 두 서비스 관리 필요 → 복잡도 증가
- **PlanetScale**: 파일 스토리지 별도 필요 → 통합성 낮음

**Best Practices**:
- Supabase 클라이언트는 `src/lib/supabase/client.ts`에서 싱글톤으로 관리
- 서버 컴포넌트용 클라이언트와 클라이언트 컴포넌트용 클라이언트 분리
- 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS 정책을 통해 사용자별 데이터 접근 제어

### 4. PDF 생성: pdf-lib

**선택 이유**:
- **서버 사이드 생성**: Node.js 환경에서 PDF 생성 (클라이언트 부담 없음)
- **벡터 기반 주석 지원**: 악보 위에 그린 주석을 PDF 레이어로 임베딩
- **기존 PDF 편집**: 업로드된 악보 PDF에 콘티 정보 오버레이 가능
- **경량**: 브라우저용 PDF 생성 라이브러리 대비 빠른 처리 속도

**대안 비교**:
- **Puppeteer/Playwright**: HTML → PDF 변환은 느리고 리소스 많이 소모
- **jsPDF**: 기존 PDF 편집 기능 제한적
- **PDFKit**: 저수준 API로 복잡한 레이아웃 구성 어려움

**Best Practices**:
- PDF 생성은 API 라우트에서 처리 (`app/api/pdf/route.ts`)
- 생성된 PDF는 임시 버퍼로 반환하거나 Supabase Storage에 캐싱
- 4초 이내 생성 목표 달성을 위해 페이지별 병렬 처리 고려
- 한글 폰트 임베딩 필수 (예: Noto Sans KR)

### 5. PDF 미리보기: React-PDF

**선택 이유**:
- **React 통합**: Next.js 컴포넌트로 쉽게 임베딩
- **페이지별 렌더링**: 20페이지 악보를 개별 페이지로 표시 가능
- **Canvas 기반**: 주석 드로잉 레이어와 통합 가능

**Best Practices**:
- 클라이언트 컴포넌트에서만 사용 (`'use client'` 필수)
- 큰 PDF는 Lazy Loading으로 성능 최적화
- 페이지 이미지는 Canvas로 렌더링하고 그 위에 SVG 주석 레이어 추가

### 6. 패키지 관리: pnpm

**선택 이유**:
- **디스크 효율성**: 심볼릭 링크로 중복 패키지 설치 방지
- **빠른 속도**: npm/yarn보다 설치 속도 빠름
- **엄격한 의존성**: Phantom dependencies 방지 → 코드 퀄리티 향상

**Best Practices**:
- `pnpm install` 사용
- `.npmrc` 파일로 설정 관리 (예: `shamefully-hoist=false`)

### 7. 테스팅: Vitest + React Testing Library

**선택 이유**:
- **Vite 기반**: Next.js와 호환되며 빠른 테스트 실행
- **Jest 호환 API**: Jest 경험 활용 가능
- **React Testing Library**: 사용자 관점 테스트 작성 → 실용주의 원칙

**Best Practices**:
- 핵심 비즈니스 로직 우선 테스트 (PDF 생성, 낙관적 잠금, 데이터 복사)
- UI 컴포넌트는 주요 인터랙션만 테스트
- `tests/unit/`, `tests/integration/` 디렉토리 분리

### 8. 린팅/포맷팅: Biome

**선택 이유**:
- **통합 도구**: ESLint + Prettier 기능을 하나로 통합 → 설정 단순화
- **빠른 속도**: Rust 기반으로 대규모 코드베이스에서도 빠름
- **일관된 스타일**: 2칸 들여쓰기, 한국어 주석 지원

**Best Practices**:
- `biome.json` 설정 파일에서 들여쓰기 2칸, 세미콜론 사용 등 규칙 정의
- `pnpm lint`, `pnpm format` 스크립트 추가
- Pre-commit hook으로 자동 포맷팅 적용 (선택적)

### 9. 환경 변수: dotenv (Next.js 내장)

**선택 이유**:
- **Next.js 내장**: 별도 라이브러리 불필요
- **환경별 파일**: `.env.local`, `.env.production` 분리 가능
- **타입 안전성**: `process.env`를 TypeScript로 타입 정의 가능

**Best Practices**:
- `.env.example` 파일로 필수 변수 목록 제공
- `.env.local`은 `.gitignore`에 추가
- 클라이언트 노출 변수는 `NEXT_PUBLIC_` 접두사 사용

## 주요 구현 전략

### 1. 동시 편집 충돌 처리: 낙관적 잠금 (Optimistic Locking)

**전략**:
- 각 엔티티(Conti, ContiSong)에 `version` 컬럼 추가 (정수형)
- 업데이트 시 `WHERE version = :expected_version` 조건으로 쿼리
- 영향받은 행이 0이면 충돌 감지 → 409 Conflict 반환
- 클라이언트는 최신 데이터를 다시 가져와 재시도

**구현 예시** (Supabase 쿼리):
```typescript
const { data, error } = await supabase
  .from('contis')
  .update({ title: newTitle, version: currentVersion + 1 })
  .eq('id', contiId)
  .eq('version', currentVersion) // 낙관적 잠금 조건
  .select()
  .single();

if (!data) {
  throw new Error('충돌 감지: 다른 사용자가 이미 수정했습니다.');
}
```

**Best Practices**:
- 클라이언트는 수정 전 현재 버전 번호를 UI에 보관
- 충돌 발생 시 사용자에게 명확한 메시지 표시 (예: "다른 사용자가 수정했습니다. 새로고침 후 다시 시도하세요.")
- 자동 병합은 Phase 2 이후 고려 (현재는 단순 재시도)

### 2. 곡 재사용 시 독립적 복사 (Independent Copy)

**전략**:
- `Song` 테이블: 곡의 기본 정보 (제목, 작곡가 등) 저장 → 참조용
- `ContiSong` 테이블: 콘티에 추가된 곡의 인스턴스 저장 (BPM, 조성, 악보, 주석 등)
- 곡을 콘티에 추가할 때 `Song` 데이터를 `ContiSong`으로 복사
- 이후 `ContiSong` 수정은 해당 콘티에만 영향 (다른 콘티의 동일 곡은 독립적)

**데이터 모델**:
```
Song (기본 정보)
├── id
├── title
├── composer
└── original_key

ContiSong (콘티별 인스턴스)
├── id
├── conti_id (FK → Conti)
├── song_id (FK → Song, nullable) -- 원본 곡 추적용 (선택적)
├── title (복사된 제목)
├── bpm_array (예: [120, 140, 100])
├── key_signature (조성)
├── sheet_music_url (Supabase Storage)
├── annotations (JSONB, 벡터 데이터)
└── version (낙관적 잠금)
```

**Best Practices**:
- 곡 추가 시 `song_id`를 함께 저장하여 원본 곡 추적 가능 (선택적 기능)
- 악보 파일은 Supabase Storage에서 참조 기반 재사용 (동일 파일 중복 업로드 방지)
- `ContiSong` 삭제 시 악보 파일은 참조 카운트 체크 후 삭제 (Phase 2 이후)

### 3. 악보 주석 저장 및 렌더링

**전략**:
- **저장 형식**: JSONB 컬럼에 벡터 데이터 배열로 저장
  ```json
  {
    "annotations": [
      {
        "page": 1,
        "type": "circle",
        "x": 100,
        "y": 200,
        "radius": 30,
        "color": "#FF0000",
        "strokeWidth": 2
      },
      {
        "page": 1,
        "type": "arrow",
        "x1": 50, "y1": 50,
        "x2": 150, "y2": 150,
        "color": "#0000FF",
        "strokeWidth": 3
      }
    ]
  }
  ```
- **렌더링**: Canvas 또는 SVG로 PDF 위에 오버레이
- **PDF 임베딩**: pdf-lib로 주석을 PDF 레이어로 변환하여 다운로드 가능한 PDF에 포함

**Best Practices**:
- 주석 데이터는 정규화된 좌표계 사용 (0-1 범위, 페이지 크기 독립적)
- 실시간 렌더링을 위해 Canvas API 사용 (<50ms 지연 목표)
- PDF 생성 시 주석을 벡터 그래픽으로 변환 (해상도 독립적)

### 4. BPM 배열 표시 형식

**전략**:
- 데이터베이스에는 정수 배열로 저장: `[120, 140, 100]`
- UI 표시 시 화살표로 연결: `"120 → 140 → 100"`
- 첫 페이지 PDF 렌더링 시 동일 형식으로 표시

**구현 예시**:
```typescript
function formatBpmArray(bpmArray: number[]): string {
  return bpmArray.join(' → ');
}

// 사용
const displayBpm = formatBpmArray([120, 140, 100]); // "120 → 140 → 100"
```

### 5. PDF 실시간 렌더링 최적화

**목표**: 1-4초 이내 PDF 생성

**전략**:
- **서버 사이드 생성**: API 라우트에서 pdf-lib 사용
- **페이지별 처리**: 20페이지 악보를 순차/병렬 처리
- **폰트 캐싱**: 한글 폰트를 메모리에 캐싱하여 반복 로딩 방지
- **이미지 최적화**: 악보 이미지를 적절한 해상도로 임베딩 (과도한 해상도 방지)

**Best Practices**:
- PDF 생성 API는 스트리밍 응답으로 구현 (전체 생성 완료 전 다운로드 시작)
- 생성된 PDF는 임시 캐싱 고려 (동일 콘티 재다운로드 시 재생성 방지)
- 성능 모니터링: 생성 시간을 로깅하여 병목 지점 파악

### 6. 파일 업로드 및 스토리지 관리

**전략**:
- **Supabase Storage 사용**: 악보 파일을 `sheet-music` 버킷에 저장
- **파일 경로**: `{conti_id}/{song_id}/{filename}.pdf`
- **최대 파일 크기**: 10MB
- **최대 페이지**: 20페이지
- **검증**: 클라이언트 + 서버 양쪽에서 파일 크기/형식 검증

**구현 예시**:
```typescript
const { data, error } = await supabase.storage
  .from('sheet-music')
  .upload(`${contiId}/${songId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

**Best Practices**:
- 업로드 전 클라이언트에서 파일 타입 검증 (`application/pdf`)
- 서버에서 PDF 페이지 수 검증 (pdf-lib로 파싱)
- 악보 삭제 시 스토리지 파일도 함께 삭제 (또는 참조 카운트 관리)

## 성능 목표 달성 전략

### 1. PDF 생성 4초 이내
- 서버 사이드 생성으로 클라이언트 부담 제거
- 폰트 캐싱 및 이미지 최적화
- 페이지별 병렬 처리 (필요시)

### 2. 페이지 로드 2초 이내
- Next.js Server Components로 초기 HTML 서버 렌더링
- 이미지 최적화 (Next.js `<Image>` 컴포넌트)
- 코드 스플리팅으로 초기 번들 크기 최소화

### 3. 주석 드로잉 실시간 렌더링 (<50ms)
- Canvas API 사용 (GPU 가속)
- 주석 데이터 정규화로 계산 최소화
- React 상태 업데이트 최적화 (debounce 또는 throttle)

## 보안 고려사항

### 1. 인증 및 권한 관리
- Supabase Auth 사용 (이메일/비밀번호 또는 OAuth)
- Row Level Security(RLS)로 사용자별 데이터 접근 제어
- API 라우트에서 인증 토큰 검증

### 2. 파일 업로드 보안
- 파일 형식 검증 (PDF만 허용)
- 파일 크기 제한 (10MB)
- 악성 파일 업로드 방지 (서버 측 PDF 파싱으로 유효성 검증)

### 3. SQL Injection 방지
- Supabase 클라이언트는 자동으로 파라미터화된 쿼리 사용
- 직접 SQL 작성 시 준비된 문 사용

## 확장성 고려사항

### 현재 스코프 (Phase 1)
- 소규모 교회 사용 (~50명, ~200개 콘티/연간)
- 동시 편집자 2-3명 제한

### 향후 확장 가능성 (Phase 2 이후)
- **실시간 협업**: Supabase Realtime으로 동시 편집자 간 변경사항 실시간 동기화
- **버전 히스토리**: 콘티 수정 이력 추적 및 복원 기능
- **검색 기능**: PostgreSQL Full-Text Search로 곡 제목/작곡가 검색
- **권한 관리**: 인도자/반주자 역할 분리, 읽기 전용 권한 등

## 결론

선택한 기술 스택은 다음 원칙을 모두 만족합니다:

✅ **코드 퀄리티 최우선**: TypeScript, Biome, Next.js 통합 구조로 가독성과 유지보수성 확보
✅ **한국어 문서화**: 모든 주석과 문서를 한국어로 작성
✅ **실용주의적 개발**: Next.js 풀스택 구조로 복잡도 최소화, Supabase로 인프라 관리 부담 제거
✅ **선택적 테스트**: 핵심 로직(PDF 생성, 낙관적 잠금)에 Vitest 적용
✅ **문서화 및 추적성**: 기술 선택 근거를 research.md에 명확히 기록

다음 단계는 **Phase 1: Design**으로, 데이터 모델 상세 정의, API 계약 명세, Quickstart 가이드 작성을 진행합니다.
