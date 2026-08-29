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
        <div className="flex items-center gap-1.5 text-[#786A5E] dark:text-[#A89F91] py-1">
          <span className="w-2 h-2 rounded-full bg-[#9C4A1A] dark:bg-[#D97706] animate-pulse" />
          <span className="text-xs font-medium">Zoya is writing...</span>
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
            <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden bg-[#241F1C] border border-[#E8D8C8] dark:border-[#38302A] shadow-sm">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#171412] border-b border-white/[0.08] text-[11px] text-[#D4C5B9] font-mono">
                <span>Code snippet</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                  className="hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3.5 text-xs font-mono text-[#FAF6F0] overflow-x-auto">
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
          <h3 key={index} className="text-base font-bold text-[#1C1917] dark:text-[#FAF6F0] mt-3 mb-1.5">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-3 border-[#9C4A1A] dark:border-[#D97706] pl-3 my-2 text-xs text-[#7C3512] dark:text-[#E8D8C8] italic bg-[#F5EBE0] dark:bg-[#26221E] py-1.5 rounded-r">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc text-sm text-[#292524] dark:text-[#FAF6F0] my-0.5 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} className="ml-4 list-decimal text-sm text-[#292524] dark:text-[#FAF6F0] my-0.5 leading-relaxed">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-sm text-[#292524] dark:text-[#FAF6F0] leading-relaxed">
            {line}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <div key="unclosed-code" className="my-3 rounded-xl overflow-hidden bg-[#241F1C] border border-[#E8D8C8] dark:border-[#38302A]">
          <pre className="p-3.5 text-xs font-mono text-[#FAF6F0] overflow-x-auto">
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
        {/* User Message Bubble in Rich Rust Brown */}
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 bg-[#9C4A1A] text-white rounded-2xl rounded-tr-sm shadow-md shadow-[#9C4A1A]/20 text-sm leading-relaxed transition-all font-medium">
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
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] flex items-center justify-center shadow-sm shadow-[#9C4A1A]/20">
            <Sparkles className="w-3 h-3 text-white font-bold" />
          </div>
          <span className="text-xs font-bold text-[#574E45] dark:text-[#A89F91]">Zoya AI</span>
        </div>

        {/* Action icons */}
        {message.content && !message.isStreaming && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-[#786A5E] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] p-1 rounded transition-all"
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Thought reasoning accordion (if Think mode was active) */}
      {message.thought && (
        <div className="mb-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E0D0BE] dark:border-[#2E2722] overflow-hidden shadow-sm">
          <button
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#7C3512] dark:text-[#E8D8C8] bg-[#F5EBE0]/70 dark:bg-[#26221E]/70 hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
              <span>Thought Process</span>
            </div>
            {isThoughtOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isThoughtOpen && (
            <div className="p-3 text-xs font-mono text-[#574E45] dark:text-[#C5B8AB] whitespace-pre-wrap border-t border-[#E8D8C8] dark:border-[#2E2722] bg-[#FAF6F0] dark:bg-[#141210]">
              {message.thought}
            </div>
          )}
        </div>
      )}

      {/* Plain streaming text in rich high-contrast dark coffee */}
      <div className="pl-7 pr-2 font-sans">
        {renderFormattedContent(message.content)}
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-[#9C4A1A] dark:bg-[#D97706] animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};
