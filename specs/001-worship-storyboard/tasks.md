# Tasks: 찬양 콘티 관리 시스템

**Input**: Design documents from `/specs/001-worship-storyboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: 테스트는 선택적입니다. spec.md에 명시적으로 요청되지 않았으므로, 핵심 비즈니스 로직(PDF 생성, 낙관적 잠금, 데이터 복사)에 대한 단위 테스트만 포함합니다.

**Organization**: 사용자 스토리별로 태스크를 그룹화하여 각 스토리를 독립적으로 구현하고 테스트할 수 있도록 합니다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 이 태스크가 속한 사용자 스토리 (US1, US2, US3, US5, US6)
- 설명에 정확한 파일 경로 포함

## Path Conventions

Next.js 15 App Router 기반 풀스택 프로젝트:
- **소스 코드**: `/Users/jaepang/code/storyboard/src/`
- **테스트**: `/Users/jaepang/code/storyboard/tests/`
- **설정 파일**: `/Users/jaepang/code/storyboard/` (루트)

---

## Phase 1: Setup (프로젝트 초기화)

**목적**: 프로젝트 기본 구조 및 개발 환경 설정

- [X] T001 Next.js 15 프로젝트 초기화 및 기본 의존성 설치 (package.json)
- [X] T002 [P] TypeScript 설정 파일 생성 (tsconfig.json)
- [X] T003 [P] Biome 설정 파일 생성 (biome.json) - 2칸 들여쓰기, 린팅 규칙
- [X] T004 [P] Vitest 설정 파일 생성 (vitest.config.ts)
- [X] T005 [P] Next.js 설정 파일 생성 (next.config.ts)
- [X] T006 [P] 환경 변수 예시 파일 생성 (.env.example)
- [X] T007 프로젝트 디렉토리 구조 생성 (src/app, src/components, src/lib, src/types, tests)
- [X] T008 [P] package.json에 스크립트 추가 (dev, build, start, lint, format, test)

---

## Phase 2: Foundational (핵심 인프라 - 모든 사용자 스토리의 선행 조건)

**목적**: 모든 사용자 스토리가 의존하는 핵심 인프라 구축

**⚠️ CRITICAL**: 이 단계가 완료되기 전까지 사용자 스토리 작업을 시작할 수 없습니다.

### Supabase 데이터베이스 설정

- [X] T009 Supabase 프로젝트 생성 및 API 키 설정 (.env.local)
- [X] T010 데이터베이스 마이그레이션: songs 테이블 생성 (data-model.md 참조)
- [X] T011 데이터베이스 마이그레이션: contis 테이블 생성 (data-model.md 참조)
- [X] T012 데이터베이스 마이그레이션: conti_songs 테이블 생성 (data-model.md 참조)
- [X] T013 데이터베이스 마이그레이션: 인덱스 생성 (외래 키, worship_date, title)
- [X] T014 데이터베이스 마이그레이션: updated_at 트리거 및 함수 생성
- [X] T015 데이터베이스 마이그레이션: contis RLS 정책 설정
- [X] T016 데이터베이스 마이그레이션: conti_songs RLS 정책 설정
- [X] T017 데이터베이스 마이그레이션: songs RLS 정책 설정
- [X] T018 Supabase Storage 버킷 생성 (sheet-music) 및 정책 설정

### TypeScript 타입 정의

- [X] T019 [P] Database 타입 정의 생성 (src/types/database.ts) - Supabase 스키마 기반
- [X] T020 [P] Conti 타입 정의 생성 (src/types/conti.ts)
- [X] T021 [P] Song 타입 정의 생성 (src/types/song.ts)
- [X] T022 [P] API 요청/응답 타입 정의 생성 (src/types/api.ts)
- [X] T023 [P] Annotation 타입 정의 생성 (src/types/annotation.ts)

### Supabase 클라이언트 설정

- [X] T024 [P] 서버 컴포넌트용 Supabase 클라이언트 생성 (src/lib/supabase/server.ts)
- [X] T025 [P] 클라이언트 컴포넌트용 Supabase 클라이언트 생성 (src/lib/supabase/client.ts)

### 공통 유틸리티

- [X] T026 [P] 에러 핸들링 유틸리티 생성 (src/lib/utils/error.ts) - API 에러 응답 포맷
- [X] T027 [P] 유효성 검증 유틸리티 생성 (src/lib/utils/validation.ts) - 입력 검증 헬퍼
- [X] T028 [P] BPM 배열 포맷 유틸리티 생성 (src/lib/utils/format.ts) - "120 → 140 → 100" 포맷

### 레이아웃 및 공통 컴포넌트

- [X] T029 Root Layout 생성 (src/app/layout.tsx) - 기본 HTML 구조, 메타데이터
- [X] T030 [P] 공통 Button 컴포넌트 생성 (src/components/common/Button.tsx)
- [X] T031 [P] 공통 Input 컴포넌트 생성 (src/components/common/Input.tsx)
- [X] T032 [P] 공통 Loading 컴포넌트 생성 (src/components/common/Loading.tsx)
- [X] T033 [P] 공통 ErrorMessage 컴포넌트 생성 (src/components/common/ErrorMessage.tsx)

**Checkpoint**: Foundation ready - 사용자 스토리 구현을 이제 시작할 수 있습니다

---

## Phase 3: User Story 1 - 콘티 기본 생성 및 곡 관리 (Priority: P1) 🎯 MVP

**Goal**: 찬양 인도자가 콘티를 생성하고, 곡 목록을 관리(추가/삭제/순서 변경)하며, 각 곡의 기본 정보(제목, BPM, 송폼)를 입력할 수 있다. 낙관적 잠금으로 동시 편집 충돌을 감지한다.

**Independent Test**: 콘티를 생성하고 곡 목록을 편집한 후 저장하여, 콘티 목록에서 해당 콘티가 조회되면 독립적으로 테스트 완료된다.

### API 구현 (US1)

- [X] T034 [P] [US1] GET /api/conti 엔드포인트 구현 (src/app/api/conti/route.ts) - 콘티 목록 조회
- [X] T035 [P] [US1] GET /api/conti/[id] 엔드포인트 구현 (src/app/api/conti/[id]/route.ts) - 단일 콘티 조회 (곡 목록 포함)
- [X] T036 [US1] POST /api/conti 엔드포인트 구현 (src/app/api/conti/route.ts) - 콘티 생성
- [X] T037 [US1] PATCH /api/conti/[id] 엔드포인트 구현 (src/app/api/conti/[id]/route.ts) - 콘티 수정, 낙관적 잠금 적용
- [X] T038 [US1] DELETE /api/conti/[id] 엔드포인트 구현 (src/app/api/conti/[id]/route.ts) - 콘티 삭제
- [X] T039 [P] [US1] POST /api/conti/[conti_id]/song 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/route.ts) - 새 곡 추가
- [X] T040 [P] [US1] POST /api/conti/[conti_id]/song/copy 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/copy/route.ts) - 기존 곡 복사
- [X] T041 [US1] PATCH /api/conti/[conti_id]/song/[song_id] 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/[song_id]/route.ts) - 곡 정보 수정, 낙관적 잠금 적용
- [X] T042 [US1] PUT /api/conti/[conti_id]/song/reorder 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/reorder/route.ts) - 곡 순서 변경
- [X] T043 [US1] DELETE /api/conti/[conti_id]/song/[song_id] 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/[song_id]/route.ts) - 곡 삭제

### UI 컴포넌트 (US1)

- [X] T044 [P] [US1] ContiForm 컴포넌트 생성 (src/components/conti/ContiForm.tsx) - 콘티 생성/편집 폼
- [X] T045 [P] [US1] SongForm 컴포넌트 생성 (src/components/song/SongForm.tsx) - 곡 추가/편집 폼
- [X] T046 [P] [US1] SongList 컴포넌트 생성 (src/components/song/SongList.tsx) - 곡 목록 표시, 드래그 앤 드롭 순서 변경
- [X] T047 [US1] 낙관적 잠금 충돌 처리 UI 컴포넌트 생성 (src/components/common/ConflictModal.tsx) - 덮어쓰기/취소 옵션 제공

### 페이지 (US1)

- [X] T048 [US1] 콘티 생성 페이지 구현 (src/app/conti/new/page.tsx) - ContiForm 사용
- [X] T049 [US1] 콘티 편집 페이지 구현 (src/app/conti/[id]/page.tsx) - ContiForm + SongList 사용

### 테스트 (US1) - 핵심 로직만

- [X] T050 [P] [US1] 낙관적 잠금 단위 테스트 (tests/unit/optimistic-locking.test.ts) - version 충돌 감지 로직
- [X] T051 [P] [US1] 곡 복사 단위 테스트 (tests/unit/song-copy.test.ts) - 독립적 복사 검증

**Checkpoint**: User Story 1 완료 - 콘티 생성, 곡 관리, 낙관적 잠금이 독립적으로 동작합니다

---

## Phase 4: User Story 5 - 콘티 조회 및 검색 (Priority: P1)

**Goal**: 반주자가 콘티 목록을 조회하고, 콘티명이나 곡명으로 검색할 수 있으며, 날짜 범위로 필터링할 수 있다.

**Independent Test**: 콘티 목록을 조회하고 검색 필터를 적용하여 원하는 콘티를 찾을 수 있으면 독립적으로 테스트 완료된다.

### API 확장 (US5)

- [X] T052 [US5] GET /api/conti에 검색 기능 추가 (src/app/api/conti/route.ts) - title, song title 검색, 날짜 범위 필터

### UI 컴포넌트 (US5)

- [X] T053 [P] [US5] SearchBar 컴포넌트 생성 (src/components/conti/SearchBar.tsx) - 검색창 및 필터
- [X] T054 [P] [US5] ContiListItem 컴포넌트 생성 (src/components/conti/ContiListItem.tsx) - 콘티 목록 항목 표시
- [X] T055 [US5] ContiList 컴포넌트 생성 (src/components/conti/ContiList.tsx) - 콘티 목록 및 페이지네이션

### 페이지 (US5)

- [X] T056 [US5] 홈 페이지 (콘티 목록) 구현 (src/app/page.tsx) - SearchBar + ContiList 사용

**Checkpoint**: User Story 5 완료 - 콘티 조회 및 검색이 독립적으로 동작합니다

---

## Phase 5: User Story 6 - 콘티 미리보기 및 PDF 다운로드 (Priority: P1)

**Goal**: 반주자가 콘티의 미리보기를 확인하거나, PDF 형태로 다운로드할 수 있다. PDF에는 곡 번호, 송폼, BPM, 악보, 주석이 모두 포함되며, 1-4초 이내에 생성된다.

**Independent Test**: 콘티를 선택하고 PDF를 다운로드하여, 모든 정보가 올바르게 포함되어 있는지 확인하면 독립적으로 테스트 완료된다.

### PDF 생성 로직 (US6)

- [X] T057 [P] [US6] PDF 생성 유틸리티 생성 (src/lib/pdf/generator.ts) - pdf-lib 기반 PDF 생성, 한글 폰트 임베딩
- [X] T058 [P] [US6] PDF 콘티 정보 페이지 렌더링 함수 (src/lib/pdf/conti-info-page.ts) - 첫 페이지 생성 (제목, 날짜, 곡 목록)
- [X] T059 [P] [US6] PDF 악보 페이지 렌더링 함수 (src/lib/pdf/sheet-music-page.ts) - 악보 임베딩, BPM 배열 "120 → 140 → 100" 포맷
- [X] T060 [US6] PDF 주석 렌더링 함수 (src/lib/pdf/annotations.ts) - 벡터 주석 PDF 레이어로 변환

### API 구현 (US6)

- [X] T061 [US6] GET /api/pdf/[conti_id] 엔드포인트 구현 (src/app/api/pdf/[conti_id]/route.ts) - PDF 생성 및 다운로드, 4초 이내 목표

### UI 컴포넌트 (US6)

- [X] T062 [P] [US6] ContiPreview 컴포넌트 생성 (src/components/conti/ContiPreview.tsx) - React-PDF 기반 미리보기
- [X] T063 [P] [US6] PdfDownloadButton 컴포넌트 생성 (src/components/conti/PdfDownloadButton.tsx) - PDF 다운로드 버튼

### 페이지 확장 (US6)

- [X] T064 [US6] 콘티 상세 페이지에 미리보기 및 다운로드 추가 (src/app/conti/[id]/page.tsx) - ContiPreview + PdfDownloadButton 통합

### 테스트 (US6) - 핵심 로직만

- [X] T065 [P] [US6] PDF 생성 통합 테스트 (tests/integration/pdf-generation.test.ts) - 샘플 데이터로 PDF 생성 및 4초 목표 검증
- [X] T066 [P] [US6] BPM 배열 포맷 단위 테스트 (tests/unit/format-bpm.test.ts) - "120 → 140 → 100" 포맷 검증

**Checkpoint**: User Story 6 완료 - 콘티 미리보기 및 PDF 다운로드가 독립적으로 동작합니다

---

## Phase 6: User Story 2 - 악보 파일 업로드 및 페이지 편집 (Priority: P2)

**Goal**: 찬양 인도자가 각 곡에 악보 파일(PDF)을 업로드하고, 각 페이지의 크기, 위치, 자르기 영역을 조정할 수 있다. 송폼과 BPM 텍스트의 폰트 크기를 페이지별로 조정할 수 있다.

**Independent Test**: 곡에 악보를 업로드하고 페이지 편집을 수행한 후, PDF 미리보기에서 편집이 올바르게 반영되는지 확인하면 독립적으로 테스트 완료된다.

### Storage 유틸리티 (US2)

- [x] T067 [P] [US2] 파일 업로드 유틸리티 생성 (src/lib/storage/upload.ts) - Supabase Storage 업로드, 10MB/20페이지 검증
- [x] T068 [P] [US2] 파일 다운로드 유틸리티 생성 (src/lib/storage/download.ts) - Supabase Storage 다운로드

### API 구현 (US2)

- [x] T069 [US2] POST /api/upload/sheet-music 엔드포인트 구현 (src/app/api/upload/sheet-music/route.ts) - 악보 업로드, conti_songs 업데이트

### UI 컴포넌트 (US2)

- [x] T070 [P] [US2] SheetMusicUploader 컴포넌트 생성 (src/components/sheet-music/SheetMusicUploader.tsx) - 파일 업로드 폼
- [x] T071 [P] [US2] SheetMusicEditor 컴포넌트 생성 (src/components/sheet-music/SheetMusicEditor.tsx) - 페이지별 편집 (scale, position, crop, fontSize)
- [x] T072 [US2] PageEditControls 컴포넌트 생성 (src/components/sheet-music/PageEditControls.tsx) - 슬라이더, 드래그, 자르기 도구

### 페이지 확장 (US2)

- [x] T073 [US2] 곡 편집 페이지에 악보 업로드/편집 추가 (src/app/conti/[id]/page.tsx) - SheetMusicUploader + SheetMusicEditor 통합

### 테스트 (US2) - 핵심 로직만

- [ ] T074 [P] [US2] 파일 업로드 통합 테스트 (tests/integration/file-upload.test.ts) - Supabase Storage 업로드 검증
  - Note: T074는 실제 Supabase Storage 테스트가 필요하므로 실제 환경에서 수동 테스트로 대체됨

**Checkpoint**: User Story 2 완료 - 악보 업로드 및 페이지 편집이 독립적으로 동작합니다

---

## Phase 7: User Story 3 - 악보 주석 작성 (Priority: P3)

**Goal**: 찬양 인도자가 악보 페이지에 벡터 기반의 펜 드로잉으로 주석을 작성할 수 있다. 색상과 두께를 선택하여 자유롭게 그릴 수 있으며, 작성한 주석은 저장되어 PDF에 포함된다.

**Independent Test**: 악보 페이지에 주석을 작성하고 저장한 후, PDF 다운로드 시 주석이 포함되어 있는지 확인하면 독립적으로 테스트 완료된다.

### API 구현 (US3)

- [ ] T075 [P] [US3] PUT /api/conti/[conti_id]/song/[song_id]/annotations 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/[song_id]/annotations/route.ts) - 주석 저장
- [ ] T076 [P] [US3] GET /api/conti/[conti_id]/song/[song_id]/annotations 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/[song_id]/annotations/route.ts) - 주석 조회

### UI 컴포넌트 (US3)

- [ ] T077 [P] [US3] AnnotationCanvas 컴포넌트 생성 (src/components/editor/AnnotationCanvas.tsx) - Canvas 기반 펜 드로잉, 실시간 렌더링 (<50ms)
- [ ] T078 [P] [US3] AnnotationToolbar 컴포넌트 생성 (src/components/editor/AnnotationToolbar.tsx) - 색상, 두께 선택 도구
- [ ] T079 [US3] AnnotationLayer 컴포넌트 생성 (src/components/editor/AnnotationLayer.tsx) - 저장된 주석 표시

### 페이지 확장 (US3)

- [ ] T080 [US3] 곡 편집 페이지에 주석 작성 기능 추가 (src/app/conti/[id]/song/[song_id]/page.tsx) - AnnotationCanvas + AnnotationToolbar 통합

### PDF 생성 확장 (US3)

- [ ] T081 [US3] PDF 주석 렌더링 통합 (src/lib/pdf/annotations.ts 확장) - 주석 데이터를 PDF 레이어로 변환

**Checkpoint**: User Story 3 완료 - 악보 주석 작성이 독립적으로 동작합니다

---

## Phase 8: User Story 4 - 유튜브 재생목록 연동 (Priority: P4)

**Goal**: 찬양 인도자가 유튜브 재생목록 URL을 입력하면, 재생목록의 영상 개수를 기반으로 초기 곡 목록이 자동 생성된다.

**Independent Test**: 유튜브 재생목록 URL을 입력하고 초기 곡 목록이 생성되는지 확인하면 독립적으로 테스트 완료된다.

### 유틸리티 (US4)

- [ ] T082 [P] [US4] 유튜브 재생목록 파싱 유틸리티 생성 (src/lib/utils/youtube.ts) - 재생목록 URL에서 영상 개수 추출

### API 구현 (US4)

- [ ] T083 [US4] POST /api/youtube/playlist 엔드포인트 구현 (src/app/api/youtube/playlist/route.ts) - 영상 개수 추출 및 초기 곡 목록 생성

### UI 컴포넌트 (US4)

- [ ] T084 [P] [US4] YoutubePlaylistInput 컴포넌트 생성 (src/components/conti/YoutubePlaylistInput.tsx) - URL 입력 폼

### 페이지 확장 (US4)

- [ ] T085 [US4] 콘티 생성 페이지에 유튜브 연동 추가 (src/app/conti/new/page.tsx) - YoutubePlaylistInput 통합

**Checkpoint**: User Story 4 완료 - 유튜브 재생목록 연동이 독립적으로 동작합니다

---

## Phase 9: Polish & Cross-Cutting Concerns

**목적**: 여러 사용자 스토리에 걸친 개선사항 및 마무리 작업

- [X] T086 [P] 환경 변수 검증 로직 추가 (src/lib/utils/env.ts) - 필수 환경 변수 체크
- [X] T087 [P] API 응답 표준화 미들웨어 추가 (src/middleware.ts) - 공통 응답 형식 적용
- [X] T088 [P] 에러 로깅 추가 (src/lib/utils/logger.ts) - 서버 측 에러 로깅
- [X] T089 코드 리팩토링 및 중복 제거 (전체 src/)
- [X] T090 [P] README.md 업데이트 (프로젝트 설명, 설치 가이드)
- [X] T091 성능 최적화: 이미지 최적화 (현재 이미지 사용 없음, 스킵)
- [X] T092 성능 최적화: 코드 스플리팅 검토 (Next.js 기본 제공)
- [X] T093 보안 강화: XSS 방지 (React 기본 제공)
- [X] T094 보안 강화: 파일 업로드 Magic Number 검증 (src/lib/storage/upload.ts)
- [X] T095 quickstart.md 검증 (개발 환경 설정 단계 확인)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 필요 - 모든 사용자 스토리를 차단
- **User Stories (Phase 3-8)**: Foundational 완료 필요
  - 사용자 스토리는 이후 병렬 진행 가능 (팀 역량 허용 시)
  - 또는 우선순위 순서대로 순차 진행 (P1 → P2 → P3 → P4)
- **Polish (Phase 9)**: 원하는 모든 사용자 스토리 완료 필요

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 이후 시작 가능 - 다른 스토리 의존성 없음
- **User Story 5 (P1)**: Foundational 이후 시작 가능 - US1과 함께 병렬 가능
- **User Story 6 (P1)**: Foundational 이후 시작 가능 - US1, US5와 독립적
- **User Story 2 (P2)**: Foundational 이후 시작 가능 - US6의 PDF 생성과 통합 필요 (약한 의존성)
- **User Story 3 (P3)**: Foundational 이후 시작 가능 - US2, US6과 통합 필요 (약한 의존성)
- **User Story 4 (P4)**: Foundational 이후 시작 가능 - US1과 통합 필요 (약한 의존성)

### Within Each User Story

- API 엔드포인트 구현 전 타입 정의 필요 (Foundational에서 완료)
- UI 컴포넌트는 API 엔드포인트와 병렬 개발 가능
- 페이지는 UI 컴포넌트 완료 후 통합
- 테스트는 구현과 병렬 가능 (핵심 로직은 구현 전 작성 권장)

### Parallel Opportunities

- Phase 1 Setup: T002-T008 모두 병렬 실행 가능
- Phase 2 Foundational:
  - 데이터베이스 마이그레이션 (T009-T018) 순차 실행 필요 (의존성)
  - 타입 정의 (T019-T023) 모두 병렬 실행 가능
  - Supabase 클라이언트 (T024-T025) 병렬 실행 가능
  - 공통 유틸리티 (T026-T028) 모두 병렬 실행 가능
  - 공통 컴포넌트 (T030-T033) 모두 병렬 실행 가능
- Phase 3-8: 각 사용자 스토리 내 [P] 태스크는 병렬 실행 가능
- Phase 9: T086-T088, T090-T094 병렬 실행 가능

---

## Parallel Example: User Story 1

```bash
# API 엔드포인트 병렬 실행:
Task: "GET /api/conti 엔드포인트 구현 (src/app/api/conti/route.ts)"
Task: "GET /api/conti/[id] 엔드포인트 구현 (src/app/api/conti/[id]/route.ts)"
Task: "POST /api/conti/[conti_id]/song 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/route.ts)"
Task: "POST /api/conti/[conti_id]/song/copy 엔드포인트 구현 (src/app/api/conti/[conti_id]/song/copy/route.ts)"

# UI 컴포넌트 병렬 실행:
Task: "ContiForm 컴포넌트 생성 (src/components/conti/ContiForm.tsx)"
Task: "SongForm 컴포넌트 생성 (src/components/song/SongForm.tsx)"
Task: "SongList 컴포넌트 생성 (src/components/song/SongList.tsx)"

# 테스트 병렬 실행:
Task: "낙관적 잠금 단위 테스트 (tests/unit/optimistic-locking.test.ts)"
Task: "곡 복사 단위 테스트 (tests/unit/song-copy.test.ts)"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 5, 6 Only)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (CRITICAL - 모든 스토리 차단)
3. Phase 3: User Story 1 완료 (콘티 생성 및 곡 관리)
4. Phase 4: User Story 5 완료 (콘티 조회 및 검색)
5. Phase 5: User Story 6 완료 (PDF 다운로드)
6. **STOP and VALIDATE**: User Stories 1, 5, 6 독립적으로 테스트
7. 배포/데모 가능 (MVP!)

### Incremental Delivery

1. Setup + Foundational → 기반 준비
2. User Story 1 → 독립 테스트 → 배포/데모 (콘티 생성)
3. User Story 5 → 독립 테스트 → 배포/데모 (검색 추가)
4. User Story 6 → 독립 테스트 → 배포/데모 (PDF 다운로드 추가, MVP!)
5. User Story 2 → 독립 테스트 → 배포/데모 (악보 업로드 추가)
6. User Story 3 → 독립 테스트 → 배포/데모 (주석 추가)
7. User Story 4 → 독립 테스트 → 배포/데모 (유튜브 연동 추가)
8. 각 스토리가 이전 기능을 깨뜨리지 않으면서 가치 추가

### Parallel Team Strategy

여러 개발자가 있는 경우:

1. 팀이 함께 Setup + Foundational 완료
2. Foundational 완료 후:
   - Developer A: User Story 1
   - Developer B: User Story 5
   - Developer C: User Story 6
3. P1 스토리 완료 후:
   - Developer A: User Story 2
   - Developer B: User Story 3
   - Developer C: User Story 4
4. 각 스토리가 독립적으로 완료되고 통합됨

---

## Notes

- [P] 태스크 = 다른 파일, 의존성 없음
- [Story] 라벨로 태스크를 특정 사용자 스토리에 매핑하여 추적성 확보
- 각 사용자 스토리는 독립적으로 완료 및 테스트 가능해야 함
- 테스트는 선택적 - 핵심 로직(PDF 생성, 낙관적 잠금, 곡 복사)만 포함
- 각 태스크 또는 논리적 그룹 완료 후 커밋
- 각 체크포인트에서 멈춰 스토리를 독립적으로 검증
- 피해야 할 것: 모호한 태스크, 동일 파일 충돌, 스토리 독립성을 깨는 교차 의존성

---

## Summary

**총 태스크 수**: 95개

**사용자 스토리별 태스크 수**:
- Setup (Phase 1): 8개
- Foundational (Phase 2): 25개
- User Story 1 (P1): 18개
- User Story 5 (P1): 5개
- User Story 6 (P1): 10개
- User Story 2 (P2): 8개
- User Story 3 (P3): 7개
- User Story 4 (P4): 4개
- Polish (Phase 9): 10개

**병렬 실행 기회**:
- Setup 단계: 7개 태스크 병렬 가능
- Foundational 단계: 15개 태스크 병렬 가능
- User Story별: 각 스토리 내 평균 3-6개 태스크 병렬 가능
- P1 스토리 (US1, US5, US6): 3개 스토리 병렬 진행 가능

**제안 MVP 범위**: User Stories 1, 5, 6 (P1) - 콘티 생성, 검색, PDF 다운로드

**독립 테스트 기준**:
- US1: 콘티 생성 및 곡 편집 후 콘티 목록에서 조회 가능
- US5: 검색 필터로 원하는 콘티 찾기 가능
- US6: PDF 다운로드 시 모든 정보 포함 확인
- US2: 악보 업로드 및 편집 후 미리보기 반영 확인
- US3: 주석 작성 후 PDF에 포함 확인
- US4: 유튜브 URL 입력 후 곡 목록 자동 생성 확인

**형식 검증**: ✅ 모든 태스크가 체크리스트 형식을 따릅니다 (체크박스, ID, [P]  표시, [Story] 라벨, 파일 경로 포함)
