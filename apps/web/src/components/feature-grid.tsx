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
    <div className="mx-auto max-w-7xl px-6 py-24">
      {/* Header - Split Layout */}
      <div className="mb-20 grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">{title}</h2>
        </div>
        <div className="flex flex-col items-start justify-end gap-6">
          <p className="text-lg text-gray-400 max-w-md">{description}</p>
          {actionLink && (
            <Link
              href={actionLink.url}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {actionLink.text}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="group relative border-t border-white/10 pt-6 transition-colors hover:border-accent/50"
          >
            <div className="mb-6 flex items-start justify-between">
              <span className="font-mono text-xs text-gray-600">00{i + 1}</span>
              <div className="text-gray-400 group-hover:text-accent transition-colors">
                {item.icon}
              </div>
            </div>

            <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">{item.description}</p>
            <Link
              href={item.linkUrl}
              className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:text-white transition-colors"
            >
              {item.linkText}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
