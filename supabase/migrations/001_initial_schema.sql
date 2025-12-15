-- 찬양 콘티 관리 시스템 - 초기 데이터베이스 스키마
-- 작성일: 2025-12-03
-- 참조: specs/001-worship-storyboard/data-model.md

-- ============================================================
-- 1. 공통 함수: updated_at 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. songs 테이블 (곡 기본 정보)
-- ============================================================

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

-- 인덱스 (제목 검색용 - LIKE 검색 최적화)
-- 한국어 풀텍스트 검색 대신 trigram 인덱스 사용
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_songs_title ON songs USING gin(title gin_trgm_ops);

-- 자동 updated_at 트리거
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON songs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. contis 테이블 (콘티 메타데이터)
-- ============================================================

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
CREATE TRIGGER update_contis_updated_at
BEFORE UPDATE ON contis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. conti_songs 테이블 (콘티별 곡 인스턴스)
-- ============================================================

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

-- ============================================================
-- 5. Row Level Security (RLS) 정책
-- ============================================================

-- 5.1 contis 테이블 RLS
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

-- 5.2 conti_songs 테이블 RLS
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

-- 5.3 songs 테이블 RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 인증된 사용자는 곡 목록 조회 가능 (곡 검색/재사용 위함)
CREATE POLICY "Authenticated users can view all songs"
ON songs FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- 6. 테스트 데이터 (선택적 - 개발 환경용)
-- ============================================================

-- 테스트 곡 (Phase 1 테스트용)
INSERT INTO songs (title, composer, original_key, genre) VALUES
('주 은혜임을', '찬송가', 'G', '찬양'),
('이 땅에 평화', '나얼', 'C', '복음성가'),
('나의 영혼 이제 깨어', '힐송', 'D', '경배');

-- ============================================================
-- 마이그레이션 완료
-- ============================================================

-- 다음 단계: Supabase Storage 버킷 생성
-- 버킷 이름: sheet-music
-- 정책: 인증된 사용자만 업로드/다운로드 가능
-- Supabase Dashboard에서 수동으로 생성하거나, Storage API 사용
