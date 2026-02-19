import { cn } from '@/lib/utils';

interface CodeWindowProps {
  code: string;
  title?: string;
  language?: string;
  className?: string;
  highlightedLines?: number[];
}

export function CodeWindow({ code, title, className, highlightedLines = [] }: CodeWindowProps) {
  const renderCode = (code: string) => {
    return code.split('\n').map((line, i) => {
      // 1. Escape HTML entities
      let processedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // 2. Tokenize strings and comments to protect them from keyword replacement
      const tokens: string[] = [];

      // Store strings
      processedLine = processedLine.replace(/('.*?'|".*?"|`.*?`)/g, (match) => {
        tokens.push(`<span class="text-green-400">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
      });

      // Store comments (if any remaining after string extraction)
      processedLine = processedLine.replace(/(\/\/.*|# .*)/g, (match) => {
        tokens.push(`<span class="text-gray-500">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
      });

      // 3. Highlight keywords in the remaining text
      // Note: We use \b to ensure whole word matches for keywords
      processedLine = processedLine
        .replace(
          /\b(import|const|from|await|return|function|export|class|interface|type)\b/g,
          '<span class="text-accent">$1</span>'
        )
        // Specific YAML/DevGraph keys - matching "key:" pattern
        .replace(
          /\b(name|type|commands|depends|ports|healthcheck|service|routes|vars):/g,
          '<span class="text-blue-400">$1:</span>'
        );

      // 4. Restore tokens
      processedLine = processedLine.replace(
        /__TOKEN_(\d+)__/g,
        (_, index) => tokens[parseInt(index)]
      );

      return (
        <div
          key={`${i}-${line.substring(0, 10)}`}
          className={cn(
            'px-4 border-l-2 border-transparent',
            highlightedLines.includes(i + 1) && 'bg-white/5 border-accent'
          )}
        >
          <span className="text-gray-600 select-none mr-4 w-6 inline-block text-right">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: processedLine }} />
        </div>
      );
    });
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
