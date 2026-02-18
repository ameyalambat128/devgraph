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
    <div className="border-t border-white/10 bg-[#050505]">
      <div
        className={cn(
          'mx-auto flex max-w-7xl flex-col gap-20 px-6 py-32 lg:flex-row lg:items-center',
          align === 'right' ? 'lg:flex-row-reverse' : ''
        )}
      >
        {/* Text Content */}
        <div className="flex-1 space-y-10 lg:py-8">
          <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl leading-[1.1]">
            {title}
          </h2>
          <p className="text-lg leading-relaxed text-gray-400 max-w-md font-light">{description}</p>
          <ul className="space-y-4 pt-2">
            {bullets.map((bullet, i) => (
              <li key={bullet} className="flex items-start gap-3 text-sm text-gray-300 font-medium">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-white/40 shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
          {linkUrl && (
            <a
              href={linkUrl}
              className="group inline-flex items-center gap-2 text-[13px] font-medium text-accent hover:text-white transition-colors pt-4"
            >
              {linkText}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </div>

        {/* Code Visual Container */}
        <div className="flex-1 w-full lg:max-w-[600px]">
          {/* Gray Card Aesthetic */}
          <div className="relative rounded-sm bg-[#CCCCCC] p-8 shadow-2xl">
            <CodeWindow
              code={code}
              title={codeTitle}
              className="bg-black border-none shadow-none text-sm min-h-[300px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
