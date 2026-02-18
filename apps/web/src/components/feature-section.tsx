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
    <div className="py-32">
      <div
        className={cn(
          'mx-auto flex max-w-7xl flex-col gap-16 px-6 lg:flex-row lg:items-center',
          align === 'right' ? 'lg:flex-row-reverse' : ''
        )}
      >
        {/* Text Content */}
        <div className="flex-1 space-y-10">
          <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="text-lg leading-relaxed text-gray-400 max-w-md">{description}</p>
          <ul className="space-y-4">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="h-1 w-1 rounded-full bg-accent" />
                {bullet}
              </li>
            ))}
          </ul>
          {linkUrl && (
            <a
              href={linkUrl}
              className="group inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-white transition-colors"
            >
              {linkText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
        </div>

        {/* Code Visual Container */}
        <div className="flex-1 w-full lg:max-w-xl">
          {/* The 'Gray Card' aesthetic from the reference */}
          <div className="relative rounded-sm bg-[#1A1A1A] p-6 shadow-2xl">
            <CodeWindow
              code={code}
              title={codeTitle}
              className="bg-black border-none shadow-none" // Nested dark window
            />
          </div>
        </div>
      </div>
    </div>
  );
}
