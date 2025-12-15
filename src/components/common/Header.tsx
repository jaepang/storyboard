'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

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
    <header className="glass border-b border-white/10 sticky top-0 z-50" style={{ height: 'var(--header-height)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white/95 hidden sm:block">찬양 콘티</span>
          </Link>

          {/* Auth UI */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="text-sm text-white/50">로딩 중...</div>
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-white/70 hidden sm:block">{user.email}</span>
                <LogoutButton variant="secondary" />
              </>
            ) : (
              <>
                <Button variant="secondary" size="small" onClick={handleLogin}>
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
