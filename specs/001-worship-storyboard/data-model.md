# 데이터 모델: 찬양 콘티 관리 시스템

**작성일**: 2025-12-01
**기능**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

## 개요

이 문서는 Supabase(PostgreSQL) 기반 데이터 모델을 정의합니다. 모든 테이블은 낙관적 잠금을 위한 `version` 컬럼과 감사 추적을 위한 타임스탬프를 포함합니다.

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│     User        │
│  (Supabase Auth)│
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐       N        ┌──────────────────┐
│     Conti       ├────────────────►│   ContiSong      │
│  (콘티 메타데이터) │                │ (콘티별 곡 인스턴스)│
└─────────────────┘                └────────┬─────────┘
                                            │ N
                                            │
                                            │ 1 (nullable)
                                   ┌────────▼─────────┐
                                   │      Song        │
                                   │   (곡 기본 정보)   │
                                   └──────────────────┘
```

**관계 설명**:
- User → Conti: 1:N (한 사용자가 여러 콘티 생성)
- Conti → ContiSong: 1:N (한 콘티에 여러 곡 포함)
- Song → ContiSong: 1:N (한 곡이 여러 콘티에 독립적으로 복사됨, nullable)

## 테이블 정의

### 1. `users` (Supabase Auth 기본 테이블)

Supabase Auth가 자동으로 관리하는 사용자 테이블입니다. 추가 프로필 정보가 필요한 경우 별도 `profiles` 테이블 생성을 고려합니다.

**주요 컬럼**:
- `id`: UUID (Primary Key)
- `email`: TEXT (Unique)
- `created_at`: TIMESTAMP

**사용 예시**:
```sql
-- Supabase Auth에서 자동 생성됨
-- 추가 프로필 정보가 필요한 경우:
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT CHECK (role IN ('leader', 'accompanist')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `contis` (콘티 메타데이터)

**설명**: 주간 예배 찬양 콘티의 기본 정보를 저장하는 테이블입니다.

**스키마**:
```sql
CREATE TABLE contis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 콘티 기본 정보
  title TEXT NOT NULL,                    -- 예: "2025년 1월 첫째 주 예배"
  worship_date DATE NOT NULL,             -- 예배 날짜
  notes TEXT,                             -- 전체 콘티에 대한 메모

  -- 낙관적 잠금 및 감사
  version INTEGER NOT NULL DEFAULT 1,     -- 낙관적 잠금용 버전
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 인덱스 (검색 성능)
  CONSTRAINT contis_title_not_empty CHECK (char_length(title) > 0)
);

-- 인덱스
CREATE INDEX idx_contis_user_id ON contis(user_id);
CREATE INDEX idx_contis_worship_date ON contis(worship_date DESC);

-- 자동 updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contis_updated_at
BEFORE UPDATE ON contis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**제약 조건**:
- `title`: 1자 이상 필수
- `worship_date`: 유효한 날짜
- `user_id`: 존재하는 사용자 (외래 키)

**비즈니스 규칙**:
- 사용자가 삭제되면 해당 사용자의 모든 콘티도 삭제 (CASCADE)
- `updated_at`은 트리거로 자동 갱신

### 3. `songs` (곡 기본 정보)

**설명**: 곡의 원본 정보를 저장하는 참조 테이블입니다. 실제 사용은 `conti_songs`에서 이루어지며, 이 테이블은 곡 재사용 시 원본 추적 및 검색을 위한 용도입니다.

**스키마**:
```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 곡 기본 정보
  title TEXT NOT NULL,                    -- 곡 제목
  composer TEXT,                          -- 작곡가
  lyricist TEXT,                          -- 작사가
  original_key TEXT,                      -- 원조 (예: "C", "G", "Dm")
  genre TEXT,                             -- 장르 (예: "찬양", "경배", "복음성가")

  -- 감사
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT songs_title_not_empty CHECK (char_length(title) > 0)
);

-- 인덱스 (제목 검색용)
CREATE INDEX idx_songs_title ON songs USING gin(to_tsvector('korean', title));

-- 자동 updated_at 트리거
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON songs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**제약 조건**:
- `title`: 1자 이상 필수
- `original_key`, `genre`: 선택적 (NULL 허용)

**비즈니스 규칙**:
- 이 테이블의 데이터는 직접 수정되지 않음 (읽기 전용 참조)
- 곡을 콘티에 추가할 때 `conti_songs`로 복사됨

### 4. `conti_songs` (콘티별 곡 인스턴스)

**설명**: 콘티에 포함된 곡의 실제 인스턴스를 저장합니다. 동일한 곡도 콘티마다 독립적인 데이터를 가지며, BPM, 조성, 악보, 주석이 개별 관리됩니다.

**스키마**:
```sql
CREATE TABLE conti_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conti_id UUID NOT NULL REFERENCES contis(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,  -- 원본 곡 추적 (선택적)

  -- 곡 정보 (songs 테이블에서 복사됨)
  title TEXT NOT NULL,
  composer TEXT,
  lyricist TEXT,

  -- 콘티별 연주 정보
  key_signature TEXT,                     -- 조성 (예: "D", "Em")
  bpm_array INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],  -- BPM 배열 (예: {120, 140, 100})
  time_signature TEXT DEFAULT '4/4',      -- 박자 (예: "4/4", "3/4", "6/8")

  -- 악보 및 주석
  sheet_music_url TEXT,                   -- Supabase Storage URL
  sheet_music_pages INTEGER DEFAULT 1,    -- 악보 페이지 수 (최대 20)
  annotations JSONB DEFAULT '{"annotations": []}'::JSONB,  -- 주석 데이터

  -- 콘티 내 순서
  order_index INTEGER NOT NULL DEFAULT 0, -- 곡 순서 (0부터 시작)

  -- 메모
  notes TEXT,                             -- 곡별 메모 (예: "후렴 2번 반복")

  -- 낙관적 잠금 및 감사
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 제약 조건
  CONSTRAINT conti_songs_title_not_empty CHECK (char_length(title) > 0),
  CONSTRAINT conti_songs_pages_limit CHECK (sheet_music_pages BETWEEN 1 AND 20),
  CONSTRAINT conti_songs_order_non_negative CHECK (order_index >= 0)
);

-- 인덱스
CREATE INDEX idx_conti_songs_conti_id ON conti_songs(conti_id);
CREATE INDEX idx_conti_songs_order ON conti_songs(conti_id, order_index);
CREATE INDEX idx_conti_songs_song_id ON conti_songs(song_id) WHERE song_id IS NOT NULL;

-- 자동 updated_at 트리거
CREATE TRIGGER update_conti_songs_updated_at
BEFORE UPDATE ON conti_songs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**제약 조건**:
- `title`: 1자 이상 필수
- `sheet_music_pages`: 1~20 범위
- `order_index`: 0 이상
- `conti_id`: 존재하는 콘티 (외래 키, CASCADE 삭제)
- `song_id`: 존재하는 곡 또는 NULL (외래 키, SET NULL 삭제)

**비즈니스 규칙**:
- 콘티가 삭제되면 해당 콘티의 모든 곡도 삭제 (CASCADE)
- 원본 곡(`songs`)이 삭제되어도 `conti_songs`는 유지 (SET NULL)
- `order_index`는 UI에서 드래그 앤 드롭으로 재정렬 가능

**주석 데이터 형식** (JSONB):
```json
{
  "annotations": [
    {
      "page": 1,                          -- 페이지 번호 (1부터 시작)
      "type": "circle",                   -- 주석 타입: circle, arrow, line, text
      "x": 0.5,                           -- 정규화된 x 좌표 (0-1)
      "y": 0.3,                           -- 정규화된 y 좌표 (0-1)
      "radius": 0.05,                     -- 정규화된 반지름 (circle)
      "color": "#FF0000",                 -- 색상 (hex)
      "strokeWidth": 2                    -- 선 두께 (픽셀)
    },
    {
      "page": 1,
      "type": "arrow",
      "x1": 0.2, "y1": 0.1,               -- 시작점
      "x2": 0.4, "y2": 0.5,               -- 끝점
      "color": "#0000FF",
      "strokeWidth": 3
    },
    {
      "page": 2,
      "type": "text",
      "x": 0.1,
      "y": 0.9,
      "text": "여기부터 느리게",
      "fontSize": 16,
      "color": "#000000"
    }
  ]
}
```

## Row Level Security (RLS) 정책

Supabase의 RLS를 사용하여 사용자별 데이터 접근을 제어합니다.

### 1. `contis` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE contis ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 콘티만 조회 가능
CREATE POLICY "Users can view their own contis"
ON contis FOR SELECT
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 콘티만 생성 가능
CREATE POLICY "Users can create their own contis"
ON contis FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 정책: 사용자는 자신의 콘티만 수정 가능
CREATE POLICY "Users can update their own contis"
ON contis FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 정책: 사용자는 자신의 콘티만 삭제 가능
CREATE POLICY "Users can delete their own contis"
ON contis FOR DELETE
USING (auth.uid() = user_id);
```

### 2. `conti_songs` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE conti_songs ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 콘티에 포함된 곡만 조회 가능
CREATE POLICY "Users can view songs in their own contis"
ON conti_songs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 콘티에만 곡 추가 가능
CREATE POLICY "Users can add songs to their own contis"
ON conti_songs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 콘티에 포함된 곡만 수정 가능
CREATE POLICY "Users can update songs in their own contis"
ON conti_songs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 콘티에 포함된 곡만 삭제 가능
CREATE POLICY "Users can delete songs from their own contis"
ON conti_songs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM contis
    WHERE contis.id = conti_songs.conti_id
    AND contis.user_id = auth.uid()
  )
);
```

### 3. `songs` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 인증된 사용자는 곡 목록 조회 가능 (곡 검색/재사용 위함)
CREATE POLICY "Authenticated users can view all songs"
ON songs FOR SELECT
TO authenticated
USING (true);

-- 정책: 곡 생성/수정은 제한 (현재는 콘티 생성 시 자동 생성)
-- Phase 2 이후 관리자 권한 필요 시 추가
```

## 마이그레이션 전략

### 초기 설정 (Phase 1)

1. **테이블 생성 순서**:
   ```sql
   -- 1. songs (의존성 없음)
   -- 2. contis (auth.users 의존)
   -- 3. conti_songs (contis, songs 의존)
   ```

2. **트리거 및 함수 생성**:
   - `update_updated_at_column()` 함수
   - 각 테이블에 `updated_at` 트리거

3. **RLS 정책 적용**:
   - 각 테이블 RLS 활성화
   - 읽기/쓰기 정책 생성

4. **인덱스 생성**:
   - 외래 키 인덱스
   - 검색 성능 인덱스 (예: `worship_date`, `title`)

### 테스트 데이터 시드 (선택적)

```sql
-- 테스트 사용자 (Supabase Auth에서 생성 필요)
-- INSERT INTO auth.users ...

-- 테스트 곡
INSERT INTO songs (title, composer, original_key, genre) VALUES
('주 은혜임을', '찬송가', 'G', '찬양'),
('이 땅에 평화', '나얼', 'C', '복음성가'),
('나의 영혼 이제 깨어', '힐송', 'D', '경배');

-- 테스트 콘티
INSERT INTO contis (user_id, title, worship_date, notes) VALUES
('[USER_UUID]', '2025년 1월 첫째 주 예배', '2025-01-05', '신년 특별 예배');

-- 테스트 곡 인스턴스
INSERT INTO conti_songs (conti_id, song_id, title, key_signature, bpm_array, order_index) VALUES
('[CONTI_UUID]', '[SONG_UUID]', '주 은혜임을', 'A', ARRAY[120, 140], 0);
```

## 향후 확장 고려사항

### Phase 2 이후 추가 가능한 테이블

1. **`conti_versions`** (버전 히스토리):
   ```sql
   CREATE TABLE conti_versions (
     id UUID PRIMARY KEY,
     conti_id UUID REFERENCES contis(id) ON DELETE CASCADE,
     version_number INTEGER,
     snapshot JSONB,  -- 콘티 전체 데이터 스냅샷
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **`shared_contis`** (콘티 공유):
   ```sql
   CREATE TABLE shared_contis (
     id UUID PRIMARY KEY,
     conti_id UUID REFERENCES contis(id) ON DELETE CASCADE,
     shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     permission TEXT CHECK (permission IN ('read', 'write')),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **`song_tags`** (곡 태그/분류):
   ```sql
   CREATE TABLE song_tags (
     id UUID PRIMARY KEY,
     song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
     tag TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

## 데이터 무결성 검증

### 1. 외래 키 제약 검증
```sql
-- 콘티가 삭제되면 곡도 삭제되는지 확인
DELETE FROM contis WHERE id = '[TEST_CONTI_ID]';
SELECT COUNT(*) FROM conti_songs WHERE conti_id = '[TEST_CONTI_ID]';  -- 0이어야 함
```

### 2. 낙관적 잠금 동작 확인
```sql
-- 버전 불일치 시 업데이트 실패 확인
UPDATE contis SET title = 'New Title', version = version + 1
WHERE id = '[CONTI_ID]' AND version = 999;  -- 존재하지 않는 버전
-- 영향받은 행: 0
```

### 3. RLS 정책 검증
```sql
-- 다른 사용자의 콘티 접근 시도 (실패해야 함)
SET request.jwt.claim.sub = '[USER_A_UUID]';
SELECT * FROM contis WHERE user_id = '[USER_B_UUID]';  -- 결과 없음
```

## 참고 자료

- **Supabase Database 문서**: https://supabase.com/docs/guides/database
- **PostgreSQL 배열 타입**: https://www.postgresql.org/docs/current/arrays.html
- **JSONB 데이터 타입**: https://www.postgresql.org/docs/current/datatype-json.html
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

**다음 단계**: `contracts/api.md` 파일에서 API 엔드포인트 명세를 작성합니다.
