import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GridItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

interface FeatureGridProps {
  title: string;
  description: string;
  items: GridItem[];
  actionLink?: { text: string; url: string };
}

export function FeatureGrid({ title, description, items, actionLink }: FeatureGridProps) {
  return (
    <div className="border-t border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-32">
        {/* Header - Split Layout */}
        <div className="mb-24 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">{title}</h2>
          </div>
          <div className="flex flex-col items-start justify-end gap-8 border-l border-white/10 pl-8 lg:pl-12">
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">{description}</p>
            {actionLink && (
              <Link
                href={actionLink.url}
                className="group inline-flex items-center gap-2 text-sm font-medium text-white hover:text-accent transition-colors"
              >
                {actionLink.text}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Grid with Vertical Lines */}
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4 border-l border-white/10">
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative bg-[#050505] p-8 transition-colors hover:bg-white/[0.02]"
            >
              <div className="mb-12 flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray-600">
                  00{i + 1}
                </span>
                <div className="text-gray-400 group-hover:text-accent transition-colors">
                  {item.icon}
                </div>
              </div>

              <h3 className="mb-4 text-xl font-bold text-white tracking-tight">{item.title}</h3>
              <p className="mb-8 text-sm leading-relaxed text-gray-400 min-h-[80px]">
                {item.description}
              </p>
              <Link
                href={item.linkUrl}
                className="inline-flex items-center gap-2 text-xs font-medium text-accent opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
              >
                {item.linkText}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
          {/* Right border closer for the grid */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-white/10" />
        </div>
      </div>
    </div>
  );
}
