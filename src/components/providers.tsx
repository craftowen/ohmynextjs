'use client';

import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';
import { type OhMyConfig, defaultConfig } from '@/lib/config';

export interface OhMyProviderProps {
  children: React.ReactNode;
  config?: Partial<OhMyConfig>;
}

export function Providers({ children, config }: OhMyProviderProps) {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    app: { ...defaultConfig.app, ...config?.app },
    theme: { ...defaultConfig.theme, ...config?.theme },
    layout: { ...defaultConfig.layout, ...config?.layout },
  };

  return (
    <ThemeProvider
      defaultTheme={mergedConfig.theme?.defaultTheme}
      storageKey={mergedConfig.theme?.storageKey}
    >
      {children}
      <Toaster richColors position="top-right" />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}
