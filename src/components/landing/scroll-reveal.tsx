'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

type Animation = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const animationMap: Record<Animation, string> = {
  'fade-up': 'fade-up',
  'fade-in': 'fade-in',
  'scale-in': 'scale-in',
  'slide-left': 'slide-in-left',
  'slide-right': 'slide-in-right',
};

export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationPlayState = 'running';
          if (once) observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const style: CSSProperties = {
    opacity: 0,
    animationName: animationMap[animation],
    animationDuration: `${duration}ms`,
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationFillMode: 'both',
    animationDelay: `${delay}ms`,
    animationPlayState: 'paused',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
