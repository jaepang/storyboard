import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import './globals.css';

export const metadata: Metadata = {
  title: '교회 찬양 콘티 관리',
  description: '교회 찬양 인도자 및 반주자를 위한 콘티(Storyboard) 작성 및 조회 프로그램',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="gradient-bg min-h-screen">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
