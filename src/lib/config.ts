export interface OhMyConfig {
  app: {
    name: string;
    description?: string;
    url?: string;
  };
  theme?: {
    defaultTheme?: 'light' | 'dark' | 'system';
    storageKey?: string;
  };
  layout?: {
    header?: boolean;
    footer?: boolean;
    sidebar?: boolean;
  };
}

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ohmynextjs.com';

export const defaultConfig: OhMyConfig = {
  app: {
    name: 'OhMyNextJS',
    description: 'Next.js SaaS Boilerplate',
    url: BASE_URL,
  },
  theme: {
    defaultTheme: 'system',
    storageKey: 'ohmynextjs-theme',
  },
  layout: {
    header: true,
    footer: true,
    sidebar: false,
  },
};
