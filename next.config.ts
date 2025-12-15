import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React 19 지원 활성화
  reactStrictMode: true,

  // 환경 변수 검증
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // TypeScript 설정
  typescript: {
    // 프로덕션 빌드 시 타입 에러 무시하지 않음
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    // 프로덕션 빌드 시 lint 에러 무시하지 않음
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
