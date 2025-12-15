# Quickstart 가이드: 찬양 콘티 관리 시스템

**작성일**: 2025-12-01
**기능**: [spec.md](./spec.md) | [plan.md](./plan.md)

## 개요

이 문서는 개발 환경 설정부터 애플리케이션 실행까지 전체 과정을 안내합니다. 약 15-20분 소요됩니다.

## 사전 요구사항

### 필수 설치 항목

- **Node.js**: v20.x LTS 이상
  - 확인: `node --version`
  - 설치: https://nodejs.org/
- **pnpm**: v9.x 이상
  - 확인: `pnpm --version`
  - 설치: `npm install -g pnpm`
- **Git**: 최신 버전
  - 확인: `git --version`

### Supabase 프로젝트 설정

1. **Supabase 계정 생성**:
   - https://supabase.com 접속
   - "Start your project" 클릭하여 가입

2. **새 프로젝트 생성**:
   - Organization 선택 또는 생성
   - 프로젝트 이름: `storyboard` (또는 원하는 이름)
   - Database Password 설정 (안전한 곳에 저장)
   - Region: `Northeast Asia (Seoul)` 선택
   - Plan: Free (개발 및 테스트용)

3. **API 키 복사**:
   - 프로젝트 대시보드 → Settings → API
   - `Project URL` 복사
   - `anon public` 키 복사

## 프로젝트 설정

### 1. 저장소 클론 및 의존성 설치

```bash
# 저장소 클론 (또는 이미 클론된 경우 생략)
cd /Users/jaepang/code/storyboard

# 의존성 설치
pnpm install
```

### 2. 환경 변수 설정

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

**.env.local 파일 편집**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**환경 변수 설명**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 공개 익명 키 (RLS로 보호됨)
- `NEXT_PUBLIC_APP_URL`: 애플리케이션 URL (로컬 개발 시 `localhost:3000`)

### 3. 데이터베이스 마이그레이션

Supabase 대시보드에서 SQL 에디터를 사용하여 스키마를 생성합니다.

**Supabase 대시보드 → SQL Editor → New Query**

#### Step 1: 기본 테이블 생성

```sql
-- songs 테이블 (곡 기본 정보)
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  composer TEXT,
  lyricist TEXT,
  original_key TEXT,
  genre TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT songs_title_not_empty CHECK (char_length(title) > 0)
);

-- contis 테이블 (콘티 메타데이터)
CREATE TABLE contis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  worship_date DATE NOT NULL,
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contis_title_not_empty CHECK (char_length(title) > 0)
);

-- conti_songs 테이블 (콘티별 곡 인스턴스)
CREATE TABLE conti_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conti_id UUID NOT NULL REFERENCES contis(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  composer TEXT,
  lyricist TEXT,
  key_signature TEXT,
  bpm_array INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  time_signature TEXT DEFAULT '4/4',
  sheet_music_url TEXT,
  sheet_music_pages INTEGER DEFAULT 1,
  annotations JSONB DEFAULT '{"annotations": []}'::JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conti_songs_title_not_empty CHECK (char_length(title) > 0),
  CONSTRAINT conti_songs_pages_limit CHECK (sheet_music_pages BETWEEN 1 AND 20),
  CONSTRAINT conti_songs_order_non_negative CHECK (order_index >= 0)
);
```

#### Step 2: 인덱스 생성

```sql
-- contis 인덱스
CREATE INDEX idx_contis_user_id ON contis(user_id);
CREATE INDEX idx_contis_worship_date ON contis(worship_date DESC);

-- conti_songs 인덱스
CREATE INDEX idx_conti_songs_conti_id ON conti_songs(conti_id);
CREATE INDEX idx_conti_songs_order ON conti_songs(conti_id, order_index);
CREATE INDEX idx_conti_songs_song_id ON conti_songs(song_id) WHERE song_id IS NOT NULL;

-- songs 인덱스 (Full-Text Search)
CREATE INDEX idx_songs_title ON songs USING gin(to_tsvector('korean', title));
```

#### Step 3: 트리거 생성

```sql
-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- contis 트리거
CREATE TRIGGER update_contis_updated_at
BEFORE UPDATE ON contis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- songs 트리거
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON songs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- conti_songs 트리거
CREATE TRIGGER update_conti_songs_updated_at
BEFORE UPDATE ON conti_songs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Step 4: Row Level Security (RLS) 설정

```sql
-- contis RLS
ALTER TABLE contis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contis"
ON contis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contis"
ON contis FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contis"
ON contis FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contis"
ON contis FOR DELETE
USING (auth.uid() = user_id);

-- conti_songs RLS
ALTER TABLE conti_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view songs in their own contis"
ON conti_songs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add songs to their own contis"
ON conti_songs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update songs in their own contis"
ON conti_songs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete songs from their own contis"
ON conti_songs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

-- songs RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all songs"
ON songs FOR SELECT
TO authenticated
USING (true);
```

#### Step 5: Storage 버킷 생성

**Supabase 대시보드 → Storage → Create a new bucket**

- **Bucket name**: `sheet-music`
- **Public bucket**: No (RLS로 접근 제어)
- **Allowed MIME types**: `application/pdf`
- **File size limit**: `10MB`

**Storage 정책 (SQL Editor에서 실행)**:
```sql
-- sheet-music 버킷 정책
CREATE POLICY "Users can upload sheet music to their own contis"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sheet-music'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM contis WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view sheet music in their own contis"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'sheet-music'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM contis WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete sheet music from their own contis"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sheet-music'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM contis WHERE user_id = auth.uid()
  )
);
```

### 4. 테스트 데이터 추가 (선택적)

테스트를 위한 샘플 데이터를 추가합니다. **먼저 Supabase Auth에서 테스트 사용자를 생성해야 합니다.**

**Supabase 대시보드 → Authentication → Users → Add User**
- Email: `test@example.com`
- Password: `test1234`
- Auto Confirm User: Yes

생성 후 사용자 ID를 복사하여 아래 쿼리에서 `[USER_UUID]`를 교체합니다.

```sql
-- 테스트 곡
INSERT INTO songs (id, title, composer, original_key, genre) VALUES
('11111111-1111-1111-1111-111111111111', '주 은혜임을', '찬송가', 'G', '찬양'),
('22222222-2222-2222-2222-222222222222', '이 땅에 평화', '나얼', 'C', '복음성가'),
('33333333-3333-3333-3333-333333333333', '나의 영혼 이제 깨어', '힐송', 'D', '경배');

-- 테스트 콘티
INSERT INTO contis (id, user_id, title, worship_date, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '[USER_UUID]', '2025년 1월 첫째 주 예배', '2025-01-05', '신년 특별 예배');

-- 테스트 곡 인스턴스
INSERT INTO conti_songs (conti_id, song_id, title, composer, key_signature, bpm_array, order_index) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '주 은혜임을', '찬송가', 'A', ARRAY[120, 140], 0),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '이 땅에 평화', '나얼', 'C', ARRAY[100], 1);
```

## 개발 서버 실행

### 1. 개발 서버 시작

```bash
pnpm dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 2. 브라우저에서 확인

1. http://localhost:3000 접속
2. 회원가입 또는 로그인 (테스트 계정: `test@example.com` / `test1234`)
3. 콘티 목록 확인 (테스트 데이터가 표시됨)

## 개발 워크플로우

### 디렉토리 구조

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes
│   │   ├── conti/        # 콘티 CRUD
│   │   ├── upload/       # 파일 업로드
│   │   └── pdf/          # PDF 생성
│   ├── conti/            # 콘티 페이지
│   │   ├── [id]/        # 콘티 상세/편집
│   │   └── new/          # 콘티 생성
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # 홈 (콘티 목록)
├── components/            # React 컴포넌트
│   ├── conti/
│   ├── song/
│   ├── editor/
│   └── common/
├── lib/                   # 유틸리티 & 서비스
│   ├── supabase/         # Supabase 클라이언트
│   ├── pdf/              # PDF 생성 로직
│   ├── storage/          # 파일 업로드/다운로드
│   └── utils/            # 헬퍼 함수
└── types/                 # TypeScript 타입 정의
```

### 주요 명령어

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint

# 포맷팅
pnpm format

# 타입 체크
pnpm type-check

# 테스트 실행
pnpm test

# 테스트 (watch 모드)
pnpm test:watch

# 테스트 커버리지
pnpm test:coverage
```

### Supabase 클라이언트 사용 예시

#### 서버 컴포넌트에서 사용

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

```typescript
// app/conti/page.tsx (서버 컴포넌트)
import { createClient } from '@/lib/supabase/server';

export default async function ContiListPage() {
  const supabase = createClient();
  const { data: contis } = await supabase
    .from('contis')
    .select('*')
    .order('worship_date', { ascending: false });

  return (
    <div>
      {contis?.map((conti) => (
        <div key={conti.id}>{conti.title}</div>
      ))}
    </div>
  );
}
```

#### 클라이언트 컴포넌트에서 사용

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// components/conti/ContiForm.tsx (클라이언트 컴포넌트)
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function ContiForm() {
  const [title, setTitle] = useState('');
  const supabase = createClient();

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('contis')
      .insert({ title, worship_date: '2025-01-05' })
      .select()
      .single();

    if (error) {
      console.error(error);
    } else {
      console.log('Created:', data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="콘티 제목"
      />
      <button type="submit">생성</button>
    </form>
  );
}
```

## 문제 해결

### 1. Supabase 연결 오류

**증상**: `Error: Invalid Supabase URL`

**해결**:
- `.env.local` 파일에 올바른 `NEXT_PUBLIC_SUPABASE_URL` 설정 확인
- 환경 변수 수정 후 개발 서버 재시작 필요

### 2. RLS 정책으로 인한 접근 거부

**증상**: `new row violates row-level security policy` 또는 빈 데이터 반환

**해결**:
- Supabase 대시보드에서 RLS 정책 확인
- 로그인한 사용자의 `auth.uid()`와 데이터의 `user_id`가 일치하는지 확인
- 테스트 시 `service_role` 키 사용 (주의: 프로덕션에서는 절대 사용 금지)

### 3. 파일 업로드 실패

**증상**: `Storage error: Permission denied`

**해결**:
- Storage 버킷 정책 확인
- 업로드 경로가 `{conti_id}/{song_id}/filename.pdf` 형식인지 확인
- `conti_id`가 현재 사용자 소유인지 확인

### 4. PDF 생성 느림

**증상**: 4초 이상 소요

**해결**:
- 악보 이미지 해상도 확인 (과도한 해상도는 성능 저하)
- 한글 폰트 파일 크기 확인 (경량 폰트 사용)
- 서버 리소스 확인 (메모리, CPU)

### 5. 타입스크립트 에러

**증상**: `Property 'user_id' does not exist on type 'Database["public"]["Tables"]["contis"]["Row"]'`

**해결**:
- Supabase CLI로 타입 재생성:
  ```bash
  pnpm supabase gen types typescript --project-id [PROJECT_ID] > src/types/database.ts
  ```

## 배포

### Vercel 배포 (권장)

1. **GitHub 저장소 연결**:
   - https://vercel.com 접속
   - "Import Project" → GitHub 저장소 선택

2. **환경 변수 설정**:
   - Vercel 대시보드 → Settings → Environment Variables
   - `.env.local`의 모든 변수 추가

3. **배포**:
   - `main` 브랜치에 푸시하면 자동 배포
   - 배포 URL: `https://[PROJECT_NAME].vercel.app`

### 환경 변수 (프로덕션)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
NEXT_PUBLIC_APP_URL=https://[YOUR_DOMAIN].vercel.app
```

## 다음 단계

1. **UI 컴포넌트 구현**: `src/components/` 디렉토리에 React 컴포넌트 작성
2. **API 라우트 구현**: `src/app/api/` 디렉토리에 엔드포인트 작성
3. **PDF 생성 로직**: `src/lib/pdf/` 디렉토리에 pdf-lib 로직 작성
4. **테스트 작성**: `tests/` 디렉토리에 Vitest 테스트 작성

**참고 문서**:
- [contracts/api.md](./contracts/api.md) - API 명세
- [data-model.md](./data-model.md) - 데이터 모델
- [research.md](./research.md) - 기술 스택 선택 근거

## 도움말 및 참고 자료

- **Next.js 문서**: https://nextjs.org/docs
- **Supabase 문서**: https://supabase.com/docs
- **TypeScript 문서**: https://www.typescriptlang.org/docs
- **pdf-lib 문서**: https://pdf-lib.js.org
- **React-PDF 문서**: https://react-pdf.org

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:
1. 콘솔 로그 (브라우저 개발자 도구)
2. Next.js 개발 서버 터미널 출력
3. Supabase 대시보드 → Logs (Database, Auth, Storage)

---

**축하합니다!** 이제 찬양 콘티 관리 시스템 개발을 시작할 준비가 완료되었습니다. 🎉
