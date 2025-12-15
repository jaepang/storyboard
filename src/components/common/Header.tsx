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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 / 타이틀 */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">찬양 콘티 관리</h1>
          </Link>

          {/* 인증 상태 UI */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">로딩 중...</div>
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-700">{user.email}</span>
                <LogoutButton variant="secondary" />
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleLogin}>
                  로그인
                </Button>
                <Button variant="primary" onClick={handleSignup}>
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
