import Image from 'next/image';
import { Terminal } from '@/components/terminal';
import { Scene3D } from '@/components/scene-3d';
import { IconGithub, IconX, IconBookOpen } from '@/components/icons';

export default function Home() {
  return (
    <main>
      <Scene3D />
      <div className="mx-auto max-w-7xl px-6">
        {/* Hero Section */}
        <div className="flex min-h-screen flex-col items-center justify-center py-20 text-center lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
          <div className="lg:max-w-lg">
            <Image
              src="/icon.png"
              alt="DevGraph"
              width={56}
              height={56}
              className="mb-4"
              priority
            />
            <h1 className="mb-4 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-6xl font-bold leading-tight tracking-tighter text-transparent">
              DevGraph
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-muted">
              One graph. Every repo.
              <br />
              Context for humans and AI.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-accent bg-accent px-3 py-2 text-sm text-white transition-colors hover:bg-accent/90 sm:px-3 sm:py-1.5"
              >
                <IconBookOpen className="h-4 w-4" />
                Docs
              </a>
              <a
                href="https://github.com/ameyalambat128/devgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white px-3 py-2 text-sm text-black transition-colors hover:bg-white/90 sm:px-3 sm:py-1.5"
              >
                <IconGithub className="h-4 w-4" />
                <span className="hidden sm:inline">Star on GitHub</span>
                <span className="sm:hidden">GitHub</span>
              </a>
              <a
                href="https://x.com/lambatameya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-600 bg-black px-3 py-2 text-sm text-white transition-colors hover:border-neutral-500 hover:bg-neutral-900 sm:px-3 sm:py-1.5"
              >
                <IconX className="h-4 w-4" />
                <span className="hidden sm:inline">Follow on X</span>
                <span className="sm:hidden">X</span>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              created by{' '}
              <a
                href="https://ameyalambat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-200"
              >
                Ameya Lambat
              </a>
            </p>
          </div>

          <div className="mt-12 w-full max-w-lg lg:mt-0">
            <Terminal />
          </div>
        </div>
      </div>
    </main>
  );
}
