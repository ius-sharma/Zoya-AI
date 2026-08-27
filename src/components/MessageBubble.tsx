'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, BrainCircuit, Sparkles } from 'lucide-react';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown formatting simply and cleanly
  const renderFormattedContent = (content: string) => {
    if (!content && message.isStreaming) {
      return (
        <div className="flex items-center gap-1.5 text-gray-400 py-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs">Zoya is writing...</span>
        </div>
      );
    }

    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          elements.push(
            <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden bg-[#111111] border border-white/[0.08]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06] text-[11px] text-gray-400 font-mono">
                <span>Code snippet</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                  className="hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3.5 text-xs font-mono text-orange-200 overflow-x-auto">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-semibold text-white mt-3 mb-1.5">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-2 border-orange-500 pl-3 my-2 text-xs text-orange-200/90 italic bg-orange-500/5 py-1 rounded-r">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc text-sm text-gray-300 my-0.5 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} className="ml-4 list-decimal text-sm text-gray-300 my-0.5 leading-relaxed">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-sm text-gray-200 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <div key="unclosed-code" className="my-3 rounded-xl overflow-hidden bg-[#111111] border border-white/[0.08]">
          <pre className="p-3.5 text-xs font-mono text-orange-200 overflow-x-auto">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        </div>
      );
    }

    return <div className="space-y-1">{elements}</div>;
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 bg-[#1e1e1e] hover:bg-[#232323] text-white rounded-2xl rounded-tr-sm border border-white/[0.06] shadow-md shadow-black/40 text-sm leading-relaxed transition-all">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col my-4 group">
      {/* AI Header with Avatar & Actions */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-sm shadow-orange-500/20">
            <Sparkles className="w-3 h-3 text-black font-bold" />
          </div>
          <span className="text-xs font-semibold text-gray-300">Zoya AI</span>
        </div>

        {/* Action icons */}
        {message.content && !message.isStreaming && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-gray-400 hover:text-white p-1 rounded transition-all"
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Thought reasoning accordion (if Think mode was active) */}
      {message.thought && (
        <div className="mb-3 rounded-xl bg-[#121212] border border-orange-500/20 overflow-hidden">
          <button
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-orange-400 bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Thought Process</span>
            </div>
            {isThoughtOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isThoughtOpen && (
            <div className="p-3 text-xs font-mono text-gray-400 whitespace-pre-wrap border-t border-white/[0.04] bg-[#0d0d0d]">
              {message.thought}
            </div>
          )}
        </div>
      )}

      {/* Plain streaming text (No bubble, clean high-contrast text) */}
      <div className="pl-7 pr-2 font-sans">
        {renderFormattedContent(message.content)}
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};
