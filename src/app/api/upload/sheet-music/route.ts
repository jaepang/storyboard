import { type NextRequest, NextResponse } from 'next/server';
import { uploadSheetMusic, validateSheetMusicFile } from '@/lib/storage/upload';
import { createClient } from '@/lib/supabase/server';
import { asUpdate } from '@/lib/supabase/types';

/**
 * POST /api/upload/sheet-music
 *
 * 악보 파일(PDF)을 업로드합니다.
 *
 * Request Body (FormData):
 * - file: PDF 파일
 * - songId: 곡 ID
 *
 * Response:
 * - 성공: { url, path, pageCount }
 * - 실패: { error, type }
 *
 * 제약사항:
 * - 최대 파일 크기: 10MB
 * - 최대 페이지 수: 20페이지
 * - 파일 형식: PDF만 허용
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const songId = formData.get('songId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    // 파일 검증
    const validation = await validateSheetMusicFile(file);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error.message,
          type: validation.error.type,
        },
        { status: 400 }
      );
    }

    // 곡이 존재하는지 확인 (songs 테이블이 아닌 conti_songs 테이블에서 확인)
    const { data: contiSong, error: songError } = await supabase
      .from('conti_songs')
      .select('id, conti_id, contis!inner(user_id)')
      .eq('id', songId)
      .single();

    if (songError || !contiSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // 권한 확인 (곡이 속한 콘티의 소유자인지 확인)
    const contiSongData = contiSong as { contis: { user_id: string } | { user_id: string }[] };
    const contiData = Array.isArray(contiSongData.contis)
      ? contiSongData.contis[0]
      : contiSongData.contis;

    if (contiData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 파일 업로드
    const result = await uploadSheetMusic(file, user.id, songId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.message || 'Upload failed',
          type: result.error?.type,
        },
        { status: 500 }
      );
    }

    // conti_songs 테이블 업데이트 (sheet_music_url, sheet_music_pages)
    const updateData = asUpdate('conti_songs', {
      sheet_music_url: result.path, // Storage path를 저장 (공개 URL 아님)
      sheet_music_pages: result.pageCount,
    });

    const { error: updateError } = await supabase
      .from('conti_songs')
      .update(updateData as never)
      .eq('id', songId);

    if (updateError) {
      console.error('Failed to update sheet music URL:', updateError);
      return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
    }

    return NextResponse.json(
      {
        url: result.url,
        path: result.path,
        pageCount: result.pageCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sheet music upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
