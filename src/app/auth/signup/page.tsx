'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/common/Loading';
import { createClient } from '@/lib/supabase/client';

/**
 * 회원가입 페이지
 *
 * Supabase Auth UI를 사용하여 이메일/비밀번호 회원가입 제공
 */
export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };

    checkUser();

    // 회원가입 후 자동 로그인 시 홈으로 리다이렉트
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="large" text="로딩 중..." light />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-6 fade-in">
        {/* Header Card */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            찬양 콘티 관리 시스템
          </h2>
          <p className="mt-2 text-gray-600">
            계정을 생성하여 콘티를 관리하세요
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-card rounded-2xl p-6 slide-up">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#10b981',
                    brandAccent: '#059669',
                    inputBackground: 'rgba(255, 255, 255, 0.8)',
                    inputBorder: 'rgba(255, 255, 255, 0.5)',
                    inputBorderFocus: '#10b981',
                    inputBorderHover: 'rgba(16, 185, 129, 0.5)',
                  },
                  borderWidths: {
                    buttonBorderWidth: '0px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                  space: {
                    inputPadding: '14px',
                    buttonPadding: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
                    buttonFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
                    inputFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
                  },
                },
              },
              className: {
                button: 'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
                input: 'backdrop-blur-sm',
                anchor: 'text-emerald-600 hover:text-emerald-700',
              },
            }}
            providers={[]}
            view="sign_up"
            showLinks={true}
            localization={{
              variables: {
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '처리 중...',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
              },
            }}
          />
        </div>

        {/* Info Card */}
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-sm text-white/80">
            회원가입 시 자동으로 로그인됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
