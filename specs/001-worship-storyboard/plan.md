# Implementation Plan: 찬양 콘티 관리 시스템

**Branch**: `001-worship-storyboard` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-worship-storyboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

교회 찬양 인도자가 주간 예배 찬양 콘티를 작성하고, 반주자가 이를 조회 및 PDF로 다운로드할 수 있는 시스템입니다. Next.js 풀스택 애플리케이션으로 구현하며, Supabase를 데이터베이스로 사용합니다. 핵심 기능은 콘티 생성/편집, 악보 업로드/편집, 주석 작성, PDF 실시간 렌더링입니다.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x (LTS)
**Primary Dependencies**: Next.js 15.x, React 19.x, Supabase Client, PDF-lib (PDF 생성), React-PDF (PDF 미리보기)
**Storage**: Supabase (PostgreSQL 기반) + Supabase Storage (악보 파일)
**Testing**: Vitest (unit/integration), React Testing Library
**Target Platform**: Web (모던 브라우저 - Chrome, Firefox, Safari 최신 버전)
**Project Type**: Web application (Next.js 풀스택)
**Performance Goals**: PDF 생성 4초 이내, 페이지 로드 2초 이내, 주석 드로잉 실시간 렌더링 (<50ms 지연)
**Constraints**: 악보 파일 최대 20페이지, 파일 크기 최대 10MB, 동시 편집자 2-3명 제한
**Scale/Scope**: 소규모 교회 사용 (~50명 사용자, ~200개 콘티/연간)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

다음 항목들이 `.specify/memory/constitution.md`의 원칙을 준수하는지 확인:

### ✅ 코드 퀄리티 최우선
- [x] 코드 가독성 및 유지보수성을 고려한 설계: TypeScript 타입 안정성, ESLint/Biome 사용
- [x] 일관된 코딩 스타일 및 네이밍 컨벤션 계획: Biome formatter, 공백 2칸 indent
- [x] 불필요한 복잡성 제거 (KISS 원칙): Next.js로 통합된 풀스택 구조, 단순한 폴더 구조

### ✅ 한국어 우선 문서화
- [x] 모든 문서를 한국어로 작성 (spec.md, plan.md, tasks.md 등): 모든 프로젝트 문서 한국어
- [x] 코드 주석 및 docstring 한국어 작성 계획: 핵심 로직에 한국어 주석 추가

### ✅ 실용주의적 개발
- [x] 현재 필요한 기능에 집중 (YAGNI): P1-P4 우선순위에 따른 점진적 구현
- [x] 과도한 추상화 회피: 직접적인 Supabase 클라이언트 사용, 불필요한 레이어 제거
- [x] 복잡성 도입 시 정당한 사유 문서화 (Complexity Tracking 섹션): 아래 섹션 참조

### ✅ 테스트 기반 개발 (선택적)
- [x] 핵심 비즈니스 로직 테스트 계획 수립: PDF 렌더링, 낙관적 잠금, 데이터 복사 로직 테스트
- [x] 통합 지점 테스트 전략 수립 (필요시): Supabase Storage 업로드, PDF 생성 통합 테스트

### ✅ 문서화 및 추적성
- [x] 주요 기술적 결정사항 문서화: research.md에 기술 스택 선택 근거 기록
- [x] 구현 과정 추적 가능하도록 계획: tasks.md로 단계별 구현 추적

## Project Structure

### Documentation (this feature)

```text
specs/001-worship-storyboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.md          # API 엔드포인트 정의
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
storyboard/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API Routes
│   │   │   ├── conti/        # 콘티 CRUD
│   │   │   ├── song/         # 곡 CRUD
│   │   │   ├── upload/       # 파일 업로드
│   │   │   └── pdf/          # PDF 생성
│   │   ├── conti/            # 콘티 페이지
│   │   │   ├── [id]/        # 콘티 상세/편집
│   │   │   └── new/          # 콘티 생성
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # 홈 (콘티 목록)
│   ├── components/            # React 컴포넌트
│   │   ├── conti/            # 콘티 관련 컴포넌트
│   │   ├── song/             # 곡 편집 컴포넌트
│   │   ├── editor/           # 악보 편집/주석 컴포넌트
│   │   └── common/           # 공통 컴포넌트
│   ├── lib/                   # 유틸리티 & 서비스
│   │   ├── supabase/         # Supabase 클라이언트
│   │   ├── pdf/              # PDF 생성 로직
│   │   ├── storage/          # 파일 업로드/다운로드
│   │   └── utils/            # 헬퍼 함수
│   └── types/                 # TypeScript 타입 정의
│       ├── conti.ts
│       ├── song.ts
│       └── database.ts
├── tests/
│   ├── unit/                  # 단위 테스트
│   └── integration/           # 통합 테스트
├── public/                    # 정적 파일
├── .env.local                 # 환경 변수 (로컬)
├── .env.example               # 환경 변수 예시
├── biome.json                 # Biome 설정
├── vitest.config.ts           # Vitest 설정
├── next.config.ts             # Next.js 설정
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

**Structure Decision**: Next.js 15 App Router 기반 풀스택 구조를 선택했습니다. API 라우트와 프론트엔드를 하나의 프로젝트에서 관리하여 개발 및 배포를 단순화합니다. `src/app/` 디렉토리에 페이지와 API를 함께 배치하고, `src/lib/`에 비즈니스 로직과 유틸리티를 분리합니다.

## Complexity Tracking

현재 Constitution 위반 사항 없음. 모든 설계가 실용주의적이고 KISS 원칙을 따릅니다.
