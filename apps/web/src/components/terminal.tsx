'use client';

import { useEffect, useState } from 'react';

const LINES = [
  { text: '> Finding devgraph blocks...', delay: 800 },
  { text: '> Parsed 12 files.', delay: 1400 },
  { text: '> Generating graph...', delay: 2000 },
  { text: '> Graph built: 45 nodes, 120 edges.', delay: 2800 },
  { text: '> Output: .devgraph/graph.json', delay: 3500 },
  { text: '✨ Done in 0.4s.', delay: 3800 },
];

export function Terminal() {
  const [started, setStarted] = useState(false);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!started) return;

    const timeouts = LINES.map((line) => {
      return setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
      }, line.delay - 500);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [started]);

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl bg-[#111] font-mono text-left shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5),0_0_0_1px_#333]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#222] bg-[#1a1a1a] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <div className="ml-3 text-xs font-medium text-[#666]">bash — 80x24</div>
      </div>

      {/* Body */}
      <div className="h-80 overflow-y-auto p-5 text-sm leading-relaxed text-[#ccc]">
        <div className="mb-2 text-white">
          <span className="mr-2 font-bold text-[#ff00ff]">$</span>
          devgraph build
        </div>
        {visibleLines.map((line, i) => (
          <div key={i} className="text-[#888]">
            {line}
          </div>
        ))}
        <span className="ml-1 inline-block h-4 w-2 animate-blink bg-[#666] align-middle" />
      </div>
    </div>
  );
}
