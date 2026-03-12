import Link from 'next/link';
import { Zap, Shield, Database, CreditCard, Globe, Code, ArrowRight, Terminal, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { TypingEffect } from '@/components/landing/typing-effect';

export const dynamic = 'force-static';

const features = [
  {
    icon: Shield,
    title: '소셜 인증',
    desc: 'Supabase Auth로 Google, 카카오, 네이버, GitHub 원클릭 로그인. 이메일/비밀번호도 지원합니다.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: CreditCard,
    title: '간편 결제',
    desc: 'TossPayments 완전 통합. 결제, 취소, 환불까지 서버 액션 하나로.',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-500',
  },
  {
    icon: Database,
    title: '타입세이프 DB',
    desc: 'Drizzle ORM + PostgreSQL. 스키마에서 타입까지, 컴파일 타임에 쿼리 오류를 잡습니다.',
    gradient: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-500',
  },
  {
    icon: Zap,
    title: '초고속 빌드',
    desc: 'Next.js 16 + Turbopack. 콜드 스타트 없는 개발 환경, 프로덕션 최적화 빌드.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-500',
  },
  {
    icon: Globe,
    title: 'SEO 최적화',
    desc: 'Sitemap, robots.txt, Open Graph 자동 생성. 서버 컴포넌트 기반 SSR로 완벽한 SEO.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500',
  },
  {
    icon: Code,
    title: 'DX 중심 설계',
    desc: 'TypeScript strict, ESLint, Vitest, Husky. 코드 품질을 자동으로 보장합니다.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
  },
];

const techStack = [
  { name: 'Next.js 16', color: 'hover:border-foreground hover:bg-foreground/5' },
  { name: 'React 19', color: 'hover:border-sky-500 hover:bg-sky-500/5' },
  { name: 'TypeScript', color: 'hover:border-blue-600 hover:bg-blue-600/5' },
  { name: 'Tailwind v4', color: 'hover:border-cyan-500 hover:bg-cyan-500/5' },
  { name: 'Supabase', color: 'hover:border-green-500 hover:bg-green-500/5' },
  { name: 'Drizzle ORM', color: 'hover:border-lime-500 hover:bg-lime-500/5' },
  { name: 'TossPayments', color: 'hover:border-blue-500 hover:bg-blue-500/5' },
  { name: 'Vitest', color: 'hover:border-yellow-500 hover:bg-yellow-500/5' },
];

const codeLines = [
  'npx create-next-app@latest --example ohmynextjs',
  'cd my-saas-app',
  'cp .env.example .env.local',
  'bun install',
  'bun run dev',
  '',
  '# Ready at http://localhost:3000 🚀',
];

const stats = [
  { value: '5분', label: '초기 설정' },
  { value: '13+', label: '테스트 파일' },
  { value: '100%', label: 'TypeScript' },
  { value: '0', label: '외부 의존성 걱정' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Apple-style full viewport with gradient glow */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4">
        {/* Background glow effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
              animation: 'glow-pulse 4s ease-in-out infinite',
            }}
          />
          <div
            className="absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full opacity-15 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, oklch(0.7 0.15 200) 0%, transparent 70%)',
              animation: 'glow-pulse 5s ease-in-out infinite 1s',
            }}
          />
          <div
            className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full opacity-15 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, oklch(0.7 0.15 320) 0%, transparent 70%)',
              animation: 'glow-pulse 6s ease-in-out infinite 2s',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Next.js 16 기반 SaaS 보일러플레이트
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="inline-block bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Build Fast.
              </span>
              <br />
              <span
                className="inline-block bg-gradient-to-r from-primary via-primary to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                style={{ animation: 'gradient-shift 6s ease infinite' }}
              >
                Ship Faster.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Next.js 16 + Supabase + Drizzle ORM + TossPayments.
              <br className="hidden sm:block" />
              한국형 SaaS를 5분 만에 시작하세요.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_40px_-8px_var(--primary)] sm:w-auto"
              >
                시작하기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://github.com/craftowen/ohmynextjs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background/50 px-8 text-sm font-medium backdrop-blur-sm transition-all hover:border-foreground/30 hover:bg-accent sm:w-auto"
              >
                <Terminal className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </ScrollReveal>

          {/* Stats row */}
          <ScrollReveal animation="fade-up" delay={450}>
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animation: 'float 2s ease-in-out infinite' }}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="h-8 w-[1px] bg-gradient-to-b from-muted-foreground/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section - Staggered cards */}
      <section className="relative px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-screen-xl">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                모든 것이{' '}
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  준비
                </span>
                되어 있습니다
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                SaaS 개발에 필요한 핵심 기능을 바로 사용하세요.
                <br />
                보일러플레이트 설정은 잊고, 비즈니스 로직에만 집중하세요.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} animation="fade-up" delay={i * 80}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-7 transition-all duration-500 hover:border-border hover:shadow-lg hover:-translate-y-1">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative z-10">
                    <div className={`inline-flex rounded-xl bg-muted/80 p-3 ${feature.iconColor} transition-transform duration-500 group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Code Section - Terminal style */}
      <section className="relative px-4 py-24 sm:py-32">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="relative mx-auto max-w-screen-lg">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal animation="slide-left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    5분
                  </span>
                  이면 충분합니다
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  복잡한 초기 설정은 잊으세요.
                  <br />
                  클론하고, 환경 변수를 넣고, 실행하면 끝.
                  <br />
                  인증, 결제, 데이터베이스가 바로 동작합니다.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Auth 설정 완료
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    DB 마이그레이션 완료
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    결제 연동 완료
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-right">
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-[oklch(0.13_0.005_262)] shadow-2xl">
                {/* Terminal header */}
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-white/40 font-mono">terminal</span>
                </div>
                {/* Terminal body */}
                <div className="p-5 font-mono text-sm leading-7 text-green-400/90">
                  <TypingEffect lines={codeLines} typingSpeed={35} lineDelay={400} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Tech Stack - Interactive badges */}
      <section className="px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-screen-xl text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              검증된{' '}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                기술 스택
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
              최신이지만 안정적인 기술만 선택했습니다.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="scale-in" delay={200}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className={`cursor-default rounded-full border border-border/60 bg-card px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-110 hover:shadow-md ${tech.color}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section - Gradient background */}
      <section className="relative px-4 py-24 sm:py-32">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full opacity-20 blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, var(--primary) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              지금 바로{' '}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                시작
              </span>
              하세요
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              복잡한 설정 없이, 비즈니스 로직에만 집중할 수 있습니다.
              <br />
              지금 가입하고 5분 만에 SaaS를 런칭하세요.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={150}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-10 text-base font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_50px_-10px_var(--primary)] sm:w-auto"
              >
                무료로 시작하기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
