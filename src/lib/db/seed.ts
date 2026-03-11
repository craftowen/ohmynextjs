import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { plans, appSettings, legalDocuments } from './schema';

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = postgres(url, { prepare: false });
  const db = drizzle(client);

  console.log('Seeding database...');

  try {
    // Plans
    await db.insert(plans).values([
      {
        name: 'Free',
        slug: 'free',
        description: '무료 플랜 - 기본 기능',
        price: 0,
        interval: 'month',
        features: ['기본 기능', '이메일 지원'],
        sortOrder: 0,
      },
      {
        name: 'Pro',
        slug: 'pro',
        description: '프로 플랜 - 모든 기능',
        price: 29000,
        interval: 'month',
        features: ['모든 기능', '우선 지원', 'API 접근', '분석 대시보드'],
        sortOrder: 1,
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: '엔터프라이즈 - 맞춤 지원',
        price: 99000,
        interval: 'month',
        features: ['모든 Pro 기능', '전담 지원', 'SLA 보장', '커스텀 통합'],
        sortOrder: 2,
      },
    ]).onConflictDoNothing();

    console.log('  Plans seeded');

    // App Settings
    await db.insert(appSettings).values([
      {
        key: 'site.name',
        value: 'OhMyNextJS',
        description: '사이트 이름',
        isPublic: true,
      },
      {
        key: 'site.maintenance',
        value: false,
        description: '유지보수 모드 활성화',
        isPublic: true,
      },
      {
        key: 'signup.enabled',
        value: true,
        description: '회원가입 허용 여부',
        isPublic: false,
      },
    ]).onConflictDoNothing();

    console.log('  App settings seeded');

    // Legal Documents
    await db.insert(legalDocuments).values([
      {
        type: 'terms',
        version: 1,
        title: '서비스 이용약관',
        content: '# 서비스 이용약관\n\n## 제1조 (목적)\n\n이 약관은 OhMyNextJS(이하 "서비스")의 이용 조건 및 절차를 규정합니다.\n\n## 제2조 (정의)\n\n1. "서비스"란 회사가 제공하는 모든 온라인 서비스를 말합니다.\n2. "회원"이란 서비스에 가입하여 이용하는 자를 말합니다.',
        isActive: true,
        effectiveDate: new Date(),
      },
      {
        type: 'privacy',
        version: 1,
        title: '개인정보처리방침',
        content: '# 개인정보처리방침\n\n## 1. 수집하는 개인정보\n\n- 이메일 주소\n- 이름\n- 로그인 기록\n\n## 2. 개인정보의 이용 목적\n\n수집된 개인정보는 서비스 제공 및 개선을 위해 사용됩니다.',
        isActive: true,
        effectiveDate: new Date(),
      },
    ]).onConflictDoNothing();

    console.log('  Legal documents seeded');
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
