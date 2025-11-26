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
      }, line.delay - 500); // adjust relative to start
    });

    return () => timeouts.forEach(clearTimeout);
  }, [started]);

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <div className="terminal-title">bash — 80x24</div>
      </div>
      <div className="terminal-body">
        <div className="terminal-line command">
          <span className="prompt">$</span> devgraph build
        </div>
        {visibleLines.map((line, i) => (
          <div key={i} className="terminal-line output">
            {line}
          </div>
        ))}
        <div className="terminal-cursor" />
      </div>
    </div>
  );
}
