import { Terminal } from './components/Terminal';

export default function Home() {
  return (
    <main>
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
            <p className="mb-8 text-sm uppercase tracking-widest text-muted/60">
              Coming Soon
            </p>
            <div className="flex justify-center gap-4 lg:justify-start">
              <a
                href="https://github.com/ameyalambat128/devgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-accent bg-accent px-6 text-base font-medium text-bg no-underline transition-all hover:border-[#ddd] hover:bg-[#ddd]"
              >
                View on GitHub
              </a>
              <a
                href="https://twitter.com/ameyalambat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-6 text-base font-medium text-text no-underline transition-all hover:border-muted hover:bg-white/5"
              >
                Follow Updates
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
