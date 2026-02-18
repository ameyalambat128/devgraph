import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
      <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-lg text-gray-400">{description}</p>
        </div>
        {actionLink && (
          <Link
            href={actionLink.url}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            {actionLink.text}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="group relative border-t border-white/10 pt-8 transition-colors hover:border-white/30"
          >
            <div className="mb-4 text-gray-400 group-hover:text-accent">{item.icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">{item.description}</p>
            <Link
              href={item.linkUrl}
              className="inline-flex items-center gap-2 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100"
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
