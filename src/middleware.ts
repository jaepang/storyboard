import { type NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 미들웨어
 *
 * 모든 요청에 대해 실행되며, API 라우트에 대한 공통 로직을 처리합니다.
 */

export function middleware(request: NextRequest) {
  // API 요청에 대한 로깅
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const start = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;

    // 개발 환경에서만 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${method} ${path}`);
    }

    // 응답 헤더 추가
    const response = NextResponse.next();

    // CORS 헤더 (필요한 경우)
    // response.headers.set('Access-Control-Allow-Origin', '*');
    // response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 보안 헤더
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // 응답 시간 기록 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - start;
      response.headers.set('X-Response-Time', `${duration}ms`);
    }

    return response;
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
