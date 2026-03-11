import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BASE_URL } from '@/lib/config';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'OhMyNextJS - Next.js SaaS Boilerplate',
    template: '%s | OhMyNextJS',
  },
  description: 'Next.js 16 + Supabase + Drizzle ORM + TossPayments 기반 한국형 SaaS 보일러플레이트. 5분 만에 프로덕션 레디 SaaS를 시작하세요.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: 'OhMyNextJS',
    title: 'OhMyNextJS - Next.js SaaS Boilerplate',
    description: 'Next.js 16 + Supabase + Drizzle ORM + TossPayments 기반 한국형 SaaS 보일러플레이트',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OhMyNextJS - Next.js SaaS Boilerplate',
    description: 'Next.js 16 + Supabase + Drizzle ORM + TossPayments 기반 한국형 SaaS 보일러플레이트',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a12' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
