import Link from 'next/link';
import Image from 'next/image';
import { IconGithub } from '@/components/icons';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.png" alt="DevGraph" width={32} height={32} className="rounded-full" />
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
