'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

/**
 * 헤더/네비게이션 컴포넌트
 *
 * 로그인 상태에 따라 조건부로 UI를 표시합니다.
 * - 로그인 전: 로그인/회원가입 버튼
 * - 로그인 후: 사용자 정보 및 로그아웃 버튼
 */
export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <header className="glass-solid sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 / 타이틀 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white drop-shadow-sm hidden sm:block">
              찬양 콘티 관리
            </h1>
          </Link>

          {/* 인증 상태 UI */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="text-sm text-white/70 animate-pulse">로딩 중...</div>
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-white/90 hidden sm:inline-block px-3 py-1.5 rounded-lg bg-white/10">
                  {user.email}
                </span>
                <LogoutButton variant="ghost" />
              </>
            ) : (
              <>
                <Button variant="ghost" size="small" onClick={handleLogin}>
                  로그인
                </Button>
                <Button variant="primary" size="small" onClick={handleSignup}>
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
