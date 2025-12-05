-- Migration 006: RLS 정책 수정 - Public Read 허용
-- User Story 0 (P4): 로그인 및 인증
--
-- 목적:
-- - SELECT는 모두 허용 (public read)
-- - INSERT/UPDATE/DELETE는 인증된 사용자만 허용
--
-- 변경사항:
-- 1. 기존 RLS 정책 삭제
-- 2. Public Read 정책 추가
-- 3. Authenticated Write 정책 추가

-- =====================================================
-- 1. contis 테이블 RLS 정책 재설정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON contis;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON contis;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON contis;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON contis;

-- Public Read 정책: 누구나 조회 가능
CREATE POLICY "Public read access for contis"
ON contis
FOR SELECT
TO public
USING (true);

-- Authenticated Write 정책: 인증된 사용자만 생성 가능
CREATE POLICY "Authenticated insert for contis"
ON contis
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated Write 정책: 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated update for contis"
ON contis
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated Write 정책: 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated delete for contis"
ON contis
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 2. conti_songs 테이블 RLS 정책 재설정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON conti_songs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON conti_songs;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conti_songs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON conti_songs;

-- Public Read 정책: 누구나 조회 가능
CREATE POLICY "Public read access for conti_songs"
ON conti_songs
FOR SELECT
TO public
USING (true);

-- Authenticated Write 정책: 인증된 사용자만 생성 가능
CREATE POLICY "Authenticated insert for conti_songs"
ON conti_songs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated Write 정책: 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated update for conti_songs"
ON conti_songs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated Write 정책: 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated delete for conti_songs"
ON conti_songs
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 3. songs 테이블 RLS 정책 재설정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON songs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON songs;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON songs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON songs;

-- Public Read 정책: 누구나 조회 가능
CREATE POLICY "Public read access for songs"
ON songs
FOR SELECT
TO public
USING (true);

-- Authenticated Write 정책: 인증된 사용자만 생성 가능
CREATE POLICY "Authenticated insert for songs"
ON songs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated Write 정책: 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated update for songs"
ON songs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated Write 정책: 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated delete for songs"
ON songs
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 검증
-- =====================================================

-- RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('contis', 'conti_songs', 'songs');

-- 정책 목록 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('contis', 'conti_songs', 'songs')
ORDER BY tablename, policyname;
