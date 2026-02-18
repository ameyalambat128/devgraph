import Link from 'next/link';
import { IconGithub } from '@/components/icons';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Simple Logo Placeholder */}
          <div className="h-6 w-6 text-accent">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-white">DevGraph</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link href="/docs" className="transition-colors hover:text-white">
            Docs
          </Link>
          <Link href="/story" className="transition-colors hover:text-white">
            Story
          </Link>
          <Link
            href="https://github.com/ameyalambat128/devgraph"
            target="_blank"
            className="transition-colors hover:text-white"
          >
            <IconGithub className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
