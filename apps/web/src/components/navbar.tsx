import Link from 'next/link';
import Image from 'next/image';
import { IconGithub } from '@/components/icons';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-white text-lg font-medium tracking-tight flex items-center gap-2">
            <span className="text-accent">*</span> Cruel
          </span>
        </Link>

        <div className="flex items-center gap-8 text-[13px] font-medium text-gray-400">
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
            <IconGithub className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
