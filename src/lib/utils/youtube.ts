/**
 * 유튜브 재생목록 URL 파싱 및 영상 개수 추출 유틸리티
 */

/**
 * 유튜브 재생목록 URL에서 재생목록 ID를 추출합니다.
 *
 * 지원하는 URL 형식:
 * - https://www.youtube.com/playlist?list=PLxxxxxx
 * - https://youtube.com/playlist?list=PLxxxxxx
 * - https://m.youtube.com/playlist?list=PLxxxxxx
 *
 * @param url - 유튜브 재생목록 URL
 * @returns 재생목록 ID 또는 null
 */
export function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // 도메인 확인
    const validHosts = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
    if (!validHosts.includes(urlObj.hostname)) {
      return null;
    }

    // 쿼리 파라미터에서 list 추출
    const playlistId = urlObj.searchParams.get('list');

    if (!playlistId) {
      return null;
    }

    // 재생목록 ID 형식 검증 (일반적으로 PL로 시작하는 34자)
    if (!/^[A-Za-z0-9_-]{13,}$/.test(playlistId)) {
      return null;
    }

    return playlistId;
  } catch {
    return null;
  }
}

/**
 * 유튜브 Data API v3를 사용하여 재생목록의 영상 개수를 추출합니다.
 *
 * @param playlistId - 재생목록 ID
 * @param apiKey - 유튜브 API 키 (환경 변수)
 * @returns 영상 개수
 * @throws API 호출 실패 시 에러
 */
export async function fetchPlaylistItemCount(playlistId: string, apiKey: string): Promise<number> {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistId}&key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YouTube API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('재생목록을 찾을 수 없습니다.');
  }

  const itemCount = data.items[0].contentDetails?.itemCount;

  if (typeof itemCount !== 'number') {
    throw new Error('재생목록 항목 개수를 가져올 수 없습니다.');
  }

  return itemCount;
}

/**
 * 유튜브 재생목록 URL에서 영상 개수를 추출하는 통합 함수입니다.
 *
 * @param url - 유튜브 재생목록 URL
 * @param apiKey - 유튜브 API 키 (환경 변수)
 * @returns 영상 개수
 * @throws URL이 잘못되었거나 API 호출 실패 시 에러
 */
export async function getPlaylistVideoCount(url: string, apiKey: string): Promise<number> {
  const playlistId = extractPlaylistId(url);

  if (!playlistId) {
    throw new Error('유효하지 않은 유튜브 재생목록 URL입니다.');
  }

  return await fetchPlaylistItemCount(playlistId, apiKey);
}
