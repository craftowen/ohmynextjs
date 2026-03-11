import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OhMyNextJS - Next.js SaaS Boilerplate';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a12',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              letterSpacing: '-2px',
            }}
          >
            OhMyNextJS
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              maxWidth: '600px',
              textAlign: 'center',
            }}
          >
            Next.js 16 + Supabase + Drizzle ORM
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            {['Next.js 16', 'React 19', 'TypeScript', 'Tailwind v4'].map((tech) => (
              <div
                key={tech}
                style={{
                  padding: '8px 20px',
                  borderRadius: '24px',
                  border: '1px solid #27272a',
                  fontSize: '18px',
                  color: '#d4d4d8',
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
