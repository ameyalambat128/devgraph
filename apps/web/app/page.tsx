import { Github } from 'lucide-react';
import { Terminal } from './components/Terminal';
import { Scene3D } from './components/Scene3D';

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <Scene3D />
      <div className="mx-auto max-w-7xl px-6">
        {/* Hero Section */}
        <div className="flex min-h-screen flex-col items-center justify-center py-20 text-center lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
          <div className="lg:max-w-lg">
            <h1 className="mb-4 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-6xl font-bold leading-tight tracking-tighter text-transparent">
              DevGraph
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-muted">
              One graph. Every repo.
              <br />
              Context for humans and AI.
            </p>
            <div className="flex justify-center gap-4 lg:justify-start">
              <a
                href="https://github.com/ameyalambat128/devgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-accent bg-accent px-6 text-base font-medium text-bg no-underline transition-all hover:border-[#ddd] hover:bg-[#ddd]"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
              <a
                href="https://x.com/lambatameya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-transparent px-6 text-base font-medium text-text no-underline transition-all hover:border-muted hover:bg-white/5"
              >
                <XIcon className="h-4 w-4" />
                Follow
              </a>
            </div>
          </div>

          <div className="mt-12 w-full max-w-lg lg:mt-0">
            <Terminal />
          </div>
        </div>
      </div>
    </main>
  );
}
