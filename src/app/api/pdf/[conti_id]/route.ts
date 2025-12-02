import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error';
import { PdfGenerator } from '@/lib/pdf/generator';
import type { ContiWithSongs } from '@/types/conti';
import type { ContiSong } from '@/types/song';

/**
 * GET /api/pdf/[conti_id] - Generate and download PDF for a conti
 *
 * Performance Target: 1-4 seconds
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ conti_id: string }> }
) {
  const startTime = Date.now();

  try {
    const { conti_id } = await params;
    const supabase = await createClient();

    // 1. Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createUnauthorizedResponse();
    }

    // 2. Fetch conti with songs
    const { data: conti, error: contiError } = await supabase
      .from('contis')
      .select('*')
      .eq('id', conti_id)
      .eq('user_id', user.id)
      .single();

    if (contiError || !conti) {
      return createNotFoundResponse('콘티');
    }

    const { data: songs, error: songsError } = await supabase
      .from('conti_songs')
      .select('*')
      .eq('conti_id', conti_id)
      .order('order_index', { ascending: true });

    if (songsError) {
      return createErrorResponse('DATABASE_ERROR', '곡 목록 조회에 실패했습니다.', {
        error: songsError,
      });
    }

    // 3. Generate PDF
    const contiWithSongs: ContiWithSongs = {
      ...(conti as unknown as Omit<ContiWithSongs, 'songs'>),
      songs: (songs || []) as ContiSong[],
    };

    const generator = await PdfGenerator.create();
    const pdfBytes = await generator.generateContiPdf(contiWithSongs, {
      includeSheetMusic: true,
      includeAnnotations: true,
    });

    // 4. Measure performance
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`PDF generated in ${duration.toFixed(2)}s for conti ${conti_id}`);

    // 5. Return PDF
    const filename = `${conti.title.replace(/[^a-zA-Z0-9가-힣\s]/g, '_')}_${conti.worship_date}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'X-Generation-Time': `${duration.toFixed(2)}s`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return createErrorResponse('INTERNAL_ERROR', 'PDF 생성 중 오류가 발생했습니다.', {
      error,
    });
  }
}
