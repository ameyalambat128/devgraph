import { ArrowRight } from 'lucide-react';
import { CodeWindow } from '@/components/code-window';
import { cn } from '@/lib/utils';

interface FeatureSectionProps {
  title: string;
  description: string;
  bullets: string[];
  code: string;
  codeTitle?: string;
  linkText?: string;
  linkUrl?: string;
  align?: 'left' | 'right';
}

export function FeatureSection({
  title,
  description,
  bullets,
  code,
  codeTitle,
  linkText = 'Learn more',
  linkUrl = '#',
  align = 'left',
}: FeatureSectionProps) {
  return (
    <div className="py-24">
      <div
        className={cn(
          'mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:flex-row lg:items-center',
          align === 'right' ? 'lg:flex-row-reverse' : ''
        )}
      >
        {/* Text Content */}
        <div className="flex-1 space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="text-lg leading-relaxed text-gray-400">{description}</p>
          <ul className="space-y-3">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {bullet}
              </li>
            ))}
          </ul>
          {linkUrl && (
            <a
              href={linkUrl}
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
            >
              {linkText}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Code Visual */}
        <div className="flex-1 w-full lg:max-w-xl">
          <div className="relative rounded-lg bg-gradient-to-b from-white/5 to-transparent p-4 backdrop-blur-sm border border-white/5">
            <CodeWindow code={code} title={codeTitle} />
          </div>
        </div>
      </div>
    </div>
  );
}
