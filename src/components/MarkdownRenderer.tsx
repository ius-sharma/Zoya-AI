'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, Info, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// Subcomponent for Code Block with Obsidian Studio Theme & Copy Action
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language ? language.toUpperCase() : 'CODE';

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden bg-[#181513] border border-[#2E2722] shadow-md shadow-black/20 text-[#FAF6F0]">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12100E] border-b border-white/[0.06] text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8594F]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B83D]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#46C45E]" />
          </div>
          <span className="px-2 py-0.5 rounded bg-white/[0.08] text-[10px] font-bold tracking-wider text-[#D4C5B9]">
            {displayLang}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#A89F91] hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/[0.06]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Container */}
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-[#F5EBE0]">
        <code>{value}</code>
      </pre>
    </div>
  );
}

// Subcomponent for Callout Detection
function CalloutBlock({ children }: { children: React.ReactNode }) {
  const contentStr = String(children);

  let icon = <Lightbulb className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706] shrink-0 mt-0.5" />;
  let title = 'Note';
  let borderClass = 'border-[#9C4A1A]/40 dark:border-[#D97706]/40 bg-[#F5EBE0]/60 dark:bg-[#201C19]/60';

  if (contentStr.includes('[!WARNING]') || contentStr.includes('⚠️') || contentStr.includes('Warning:')) {
    icon = <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
    title = 'Warning';
    borderClass = 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20';
  } else if (contentStr.includes('[!TIP]') || contentStr.includes('💡') || contentStr.includes('Tip:')) {
    icon = <Sparkles className="w-4 h-4 text-[#B85D19] dark:text-[#E87A38] shrink-0 mt-0.5" />;
    title = 'Pro Tip';
    borderClass = 'border-[#B85D19]/40 bg-[#F5EBE0]/70 dark:bg-[#26221E]/70';
  } else if (contentStr.includes('[!IMPORTANT]') || contentStr.includes('📌')) {
    icon = <Info className="w-4 h-4 text-[#7C3512] dark:text-[#C5B8AB] shrink-0 mt-0.5" />;
    title = 'Important';
    borderClass = 'border-[#7C3512]/40 bg-[#FAF6F0] dark:bg-[#181513]';
  }

  return (
    <div className={`my-3 p-3.5 rounded-2xl border ${borderClass} flex items-start gap-3 shadow-xs`}>
      {icon}
      <div className="flex-1 text-xs text-[#292524] dark:text-[#FAF6F0] leading-relaxed [&>p]:my-0.5">
        <span className="font-bold block text-[#7C3512] dark:text-[#E8D8C8] mb-0.5 uppercase text-[10px] tracking-wider">
          {title}
        </span>
        {children}
      </div>
    </div>
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body space-y-1 text-sm sm:text-[15px] leading-[1.75] text-[#292524] dark:text-[#FAF6F0]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6F0] mt-5 mb-2 pb-1.5 border-b border-[#E8D8C8] dark:border-[#2E2722] tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#FAF6F0] mt-4 mb-2 pb-1 border-b border-[#E8D8C8]/60 dark:border-[#2E2722]/60 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-[#1C1917] dark:text-[#FAF6F0] mt-3.5 mb-1.5 tracking-tight">
              {children}
            </h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="my-2 leading-relaxed text-[#292524] dark:text-[#FAF6F0]">{children}</p>
          ),

          // Bold & Emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-[#1C1917] dark:text-[#FFFFFF] bg-[#9C4A1A]/5 dark:bg-[#D97706]/10 px-1 py-0.2 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#7C3512] dark:text-[#E8D8C8]">{children}</em>
          ),

          // Lists
          ul: ({ children }) => <ul className="my-2.5 pl-1 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2.5 pl-1 space-y-2 list-decimal list-inside">{children}</ol>,
          li: ({ children, ...props }) => (
            <li className="leading-relaxed text-[#292524] dark:text-[#FAF6F0] my-0.5" {...props}>
              {children}
            </li>
          ),

          // Blockquote / Smart Callout
          blockquote: ({ children }) => <CalloutBlock>{children}</CalloutBlock>,

          // Modern Glassmorphism Table
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-2xl border border-[#E8D8C8] dark:border-[#2E2722] shadow-sm bg-[#FFFFFF] dark:bg-[#181513]">
              <table className="w-full text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#FAF6F0] dark:bg-[#201C19] border-b border-[#E8D8C8] dark:border-[#2E2722]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-[#F5EBE0] dark:divide-[#26221E]">{children}</tbody>,
          tr: ({ children }) => (
            <tr className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#26221E]/60 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#7C3512] dark:text-[#FAF6F0]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-xs sm:text-sm text-[#292524] dark:text-[#E8D8C8] leading-relaxed">
              {children}
            </td>
          ),

          // Code: Inline vs Block
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md font-mono text-[13px] bg-[#F5EBE0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#E87A38] border border-[#E8D8C8]/70 dark:border-[#38302A]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const codeContent = String(children).replace(/\n$/, '');
            const lang = match ? match[1] : '';

            return <CodeBlock language={lang} value={codeContent} />;
          },

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9C4A1A] dark:text-[#D97706] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),

          // Dividers
          hr: () => <hr className="my-4 border-t border-[#E8D8C8] dark:border-[#2E2722]" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
