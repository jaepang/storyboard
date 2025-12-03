# 찬양 콘티 관리 시스템 (Storyboard)

교회 찬양 인도자와 반주자를 위한 콘티(Storyboard) 작성 및 조회 프로그램입니다.

## 주요 기능

- **콘티 생성 및 관리**: 예배 날짜별 찬양 콘티 생성, 곡 추가/삭제/순서 변경
- **곡 정보 관리**: 제목, BPM, 송폼 등 곡 정보 입력 및 편집
- **악보 파일 업로드**: PDF 형식의 악보 파일 업로드 및 페이지별 편집
- **PDF 생성 및 다운로드**: 콘티 정보를 포함한 PDF 파일 생성 (1-4초 이내)
- **검색 및 필터링**: 콘티 제목, 곡 제목, 예배 날짜로 검색 및 필터링
- **낙관적 잠금**: 동시 편집 시 충돌 감지 및 해결

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Storage**: Supabase Storage (악보 파일)
- **PDF 생성**: pdf-lib
- **PDF 미리보기**: react-pdf
- **드래그 앤 드롭**: @dnd-kit
- **테스트**: Vitest, React Testing Library
- **린트/포맷**: Biome

## 설치 가이드

### 사전 요구사항

- Node.js 20.x (LTS)
- pnpm 8.x 이상
- Supabase 프로젝트 (무료 플랜 가능)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd storyboard
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase 데이터베이스 설정

Supabase 프로젝트의 SQL Editor에서 다음 마이그레이션을 순서대로 실행하세요:

1. `specs/001-worship-storyboard/migrations/001_create_tables.sql`
2. `specs/001-worship-storyboard/migrations/002_create_indexes.sql`
3. `specs/001-worship-storyboard/migrations/003_create_triggers.sql`
4. `specs/001-worship-storyboard/migrations/004_create_rls_policies.sql`
5. `specs/001-worship-storyboard/migrations/005_create_storage_bucket.sql`

### 5. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

## 사용 방법

### 콘티 생성

1. 홈 화면에서 "새 콘티 생성" 버튼 클릭
2. 콘티 제목과 예배 날짜 입력
3. 곡 추가 버튼을 클릭하여 곡 정보 입력
4. 드래그 앤 드롭으로 곡 순서 변경
5. 저장 버튼 클릭

### 악보 업로드

1. 콘티 편집 페이지에서 곡 선택
2. "악보 업로드" 버튼 클릭
3. PDF 파일 선택 (최대 10MB, 20페이지)
4. 페이지별 크기, 위치, 자르기 편집 (선택 사항)

### PDF 다운로드

1. 콘티 목록에서 콘티 선택
2. "PDF 다운로드" 버튼 클릭
3. 브라우저에서 자동 다운로드

### 검색 및 필터링

1. 홈 화면 상단의 검색창에 콘티 제목 또는 곡 제목 입력
2. 예배 날짜 범위 선택 (선택 사항)
3. 정렬 옵션 선택 (예배 날짜, 생성일, 제목)

## 개발 가이드

### 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 타입 체크
pnpm type-check

# 린트 및 포맷 체크
pnpm lint

# 린트 및 포맷 자동 수정
pnpm lint:fix

# 테스트 실행
pnpm test

# 테스트 (watch 모드)
pnpm test:watch

# 테스트 커버리지
pnpm test:coverage
```

### 프로젝트 구조

```
storyboard/
├── src/
│   ├── app/                  # Next.js App Router 페이지 및 API 라우트
│   │   ├── api/             # API 엔드포인트
│   │   ├── conti/           # 콘티 관련 페이지
│   │   └── layout.tsx       # 루트 레이아웃
│   ├── components/          # React 컴포넌트
│   │   ├── common/          # 공통 컴포넌트 (Button, Input, Loading 등)
│   │   ├── conti/           # 콘티 관련 컴포넌트
│   │   ├── song/            # 곡 관련 컴포넌트
│   │   └── sheet-music/     # 악보 관련 컴포넌트
│   ├── lib/                 # 라이브러리 및 유틸리티
│   │   ├── pdf/             # PDF 생성 로직
│   │   ├── storage/         # Supabase Storage 유틸리티
│   │   ├── supabase/        # Supabase 클라이언트
│   │   └── utils/           # 공통 유틸리티
│   └── types/               # TypeScript 타입 정의
├── tests/                   # 테스트 파일
│   ├── integration/         # 통합 테스트
│   └── unit/                # 단위 테스트
├── specs/                   # 기능 스펙 및 계획 문서
└── .specify/                # Specify 템플릿 설정
```

### 프로젝트 원칙

이 프로젝트는 다음 핵심 원칙을 따릅니다:

1. **코드 퀄리티 최우선**: 가독성과 유지보수성을 고려한 깨끗한 코드 작성
2. **한국어 우선 문서화**: 모든 문서와 주석은 한국어로 작성
3. **실용주의적 개발**: 과도한 추상화보다는 실제 필요한 기능 구현에 집중
4. **선택적 테스트**: 핵심 로직에 대한 테스트 작성
5. **체계적 문서화**: 구현 과정과 결정 사항 추적

자세한 내용은 [Constitution](.specify/memory/constitution.md)을 참고하세요.

### LLM 에이전트 사용 시

Claude 등의 LLM 에이전트를 사용하여 개발할 때는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

### 기능 개발 워크플로우

1. `/speckit.specify` - 기능 스펙 작성
2. `/speckit.plan` - 구현 계획 수립
3. `/speckit.tasks` - 태스크 분해
4. `/speckit.implement` - 구현 실행

## 문서 구조

- `.specify/memory/constitution.md` - 프로젝트 헌법 및 핵심 원칙
- `CLAUDE.md` - LLM 에이전트 개발 가이드
- `specs/001-worship-storyboard/` - 찬양 콘티 기능 스펙 및 계획
  - `spec.md` - 기능 명세서
  - `plan.md` - 구현 계획
  - `tasks.md` - 작업 분해
  - `data-model.md` - 데이터 모델
  - `contracts/api.md` - API 스펙

## 라이선스

이 프로젝트는 개인 사용을 목적으로 합니다.

---

**참고**: 이 프로젝트는 Specify 템플릿을 기반으로 생성되었습니다.
