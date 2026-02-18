import { cn } from '@/lib/utils';

interface CodeWindowProps {
  code: string;
  title?: string;
  language?: string;
  className?: string;
  highlightedLines?: number[];
}

export function CodeWindow({ code, title, className, highlightedLines = [] }: CodeWindowProps) {
  // Simple syntax highlighting simulation (very basic)
  const renderCode = (code: string) => {
    return code.split('\n').map((line, i) => (
      <div
        key={`${i}-${line.substring(0, 10)}`}
        className={cn(
          'px-4 border-l-2 border-transparent',
          highlightedLines.includes(i + 1) && 'bg-white/5 border-accent'
        )}
      >
        <span className="text-gray-600 select-none mr-4 w-6 inline-block text-right">{i + 1}</span>
        <span
          dangerouslySetInnerHTML={{
            __html: line
              // First escape HTML entities
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              // Then apply syntax highlighting
              .replace(
                /(import|const|from|await|return|function|export|class|interface|type)/g,
                '<span class="text-accent">$1</span>'
              )
              .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-400">$1</span>')
              .replace(/(\/\/.*|# .*)/g, '<span class="text-gray-500">$1</span>')
              .replace(/({|}|\[|\]|\(|\))/g, '<span class="text-gray-400">$1</span>')
              .replace(
                /(name:|type:|commands:|depends:|ports:|healthcheck:|service:|routes:|vars:)/g,
                '<span class="text-blue-400">$1</span>'
              ),
          }}
        />
      </div>
    ));
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl font-mono text-sm',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <span className="text-xs text-gray-400">{title}</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      )}
      <div className="py-4 overflow-x-auto text-gray-300 leading-relaxed">{renderCode(code)}</div>
    </div>
  );
}
