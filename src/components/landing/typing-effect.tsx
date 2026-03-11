'use client';

import { useEffect, useState, useRef } from 'react';

interface TypingEffectProps {
  lines: string[];
  typingSpeed?: number;
  lineDelay?: number;
  className?: string;
}

export function TypingEffect({
  lines,
  typingSpeed = 40,
  lineDelay = 500,
  className = '',
}: TypingEffectProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || currentLine >= lines.length) return;

    if (currentChar === 0 && currentLine > 0) {
      const lineTimer = setTimeout(() => {
        setCurrentChar(1);
      }, lineDelay);
      return () => clearTimeout(lineTimer);
    }

    const line = lines[currentLine];
    if (currentChar <= line.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const copy = [...prev];
          copy[currentLine] = line.slice(0, currentChar);
          return copy;
        });
        setCurrentChar((c) => c + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    const nextLineTimer = setTimeout(() => {
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
    }, 0);
    return () => clearTimeout(nextLineTimer);
  }, [started, currentLine, currentChar, lines, typingSpeed, lineDelay]);

  const isTyping = currentLine < lines.length;

  return (
    <div ref={ref} className={className}>
      {displayedLines.map((line, i) => (
        <div key={i} className="flex">
          <span className="text-muted-foreground/60 select-none mr-4 w-5 text-right tabular-nums">
            {i + 1}
          </span>
          <span>{line}</span>
          {i === currentLine && isTyping && (
            <span
              className="ml-0.5 inline-block w-[2px] h-[1.2em] bg-primary"
              style={{ animation: 'typing-cursor 0.8s step-end infinite' }}
            />
          )}
        </div>
      ))}
      {isTyping && displayedLines.length <= currentLine && (
        <div className="flex">
          <span className="text-muted-foreground/60 select-none mr-4 w-5 text-right tabular-nums">
            {displayedLines.length + 1}
          </span>
          <span
            className="inline-block w-[2px] h-[1.2em] bg-primary"
            style={{ animation: 'typing-cursor 0.8s step-end infinite' }}
          />
        </div>
      )}
    </div>
  );
}
