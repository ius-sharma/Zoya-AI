'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface InChatSearchBarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

const MATCH_CLASS = 'chat-search-match';
const ACTIVE_MATCH_CLASSES = [
  'ring-2',
  'ring-[#9C4A1A]',
  'dark:ring-[#D97706]',
  '!bg-[#9C4A1A]',
  'dark:!bg-[#D97706]',
  '!text-white',
  'font-bold',
  'shadow-sm',
];

export const InChatSearchBar: React.FC<InChatSearchBarProps> = ({
  containerRef,
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<HTMLElement[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Helper to remove all search marks and restore original text nodes
  const removeAllHighlights = useCallback((container: HTMLElement) => {
    const markElements = container.querySelectorAll<HTMLElement>(`mark.${MATCH_CLASS}`);
    markElements.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
  }, []);

  // Helper to apply highlight marks to text nodes inside container
  const applyHighlights = useCallback(
    (container: HTMLElement, searchTerm: string): HTMLElement[] => {
      removeAllHighlights(container);

      const trimmed = searchTerm.trim();
      if (!trimmed) return [];

      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (
            tag === 'mark' ||
            tag === 'script' ||
            tag === 'style' ||
            tag === 'button' ||
            tag === 'input' ||
            tag === 'textarea'
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const textNodes: Text[] = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
      }

      const foundMarks: HTMLElement[] = [];

      for (const textNode of textNodes) {
        const text = textNode.nodeValue || '';
        if (!regex.test(text)) continue;

        regex.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIdx = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIdx) {
            fragment.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
          }
          const mark = document.createElement('mark');
          mark.className = `${MATCH_CLASS} px-1 py-0.5 rounded bg-amber-300/80 dark:bg-amber-500/40 text-stone-900 dark:text-stone-100 transition-all duration-150`;
          mark.textContent = match[0];
          fragment.appendChild(mark);
          foundMarks.push(mark);
          lastIdx = regex.lastIndex;
        }

        if (lastIdx < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
        }

        textNode.parentNode?.replaceChild(fragment, textNode);
      }

      return foundMarks;
    },
    [removeAllHighlights]
  );

  // Focus input automatically when search bar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      if (containerRef.current) {
        removeAllHighlights(containerRef.current);
      }
      setQuery('');
      setMatches([]);
      setCurrentMatchIndex(0);
    }
  }, [isOpen, containerRef, removeAllHighlights]);

  // Execute highlight search whenever query changes
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    if (!query.trim()) {
      removeAllHighlights(containerRef.current);
      setMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const found = applyHighlights(containerRef.current, query);
    setMatches(found);
    setCurrentMatchIndex(0);

    if (found.length > 0) {
      found[0].classList.add(...ACTIVE_MATCH_CLASSES);
      found[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [query, isOpen, containerRef, applyHighlights, removeAllHighlights]);

  // Clean up highlights on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        removeAllHighlights(containerRef.current);
      }
    };
  }, [containerRef, removeAllHighlights]);

  const goToMatch = useCallback(
    (targetIndex: number) => {
      if (matches.length === 0) return;

      // Remove active class from previous
      if (matches[currentMatchIndex]) {
        matches[currentMatchIndex].classList.remove(...ACTIVE_MATCH_CLASSES);
      }

      // Add active class to new
      const nextMatch = matches[targetIndex];
      if (nextMatch) {
        nextMatch.classList.add(...ACTIVE_MATCH_CLASSES);
        nextMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setCurrentMatchIndex(targetIndex);
    },
    [matches, currentMatchIndex]
  );

  const handleNext = useCallback(() => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    goToMatch(nextIdx);
  }, [matches.length, currentMatchIndex, goToMatch]);

  const handlePrev = useCallback(() => {
    if (matches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    goToMatch(prevIdx);
  }, [matches.length, currentMatchIndex, goToMatch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  if (!isOpen) return null;

  const totalCount = matches.length;
  const currentCount = totalCount > 0 ? currentMatchIndex + 1 : 0;

  return (
    <div className="absolute top-3 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF]/95 dark:bg-[#1C1917]/95 backdrop-blur-md rounded-2xl border border-[#E0D0BE] dark:border-[#382F27] shadow-xl shadow-stone-400/20 dark:shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-200">
      <Search className="w-3.5 h-3.5 text-[#8C7A6B] dark:text-[#A89F91] shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search in chat..."
        className="w-32 sm:w-44 bg-transparent text-xs text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#A89F91] dark:placeholder-[#6E645A] outline-none border-none ring-0 focus:ring-0"
      />

      {/* Counter */}
      {query.trim() && (
        <span className="text-[11px] font-mono font-medium text-[#786A5E] dark:text-[#A89F91] px-1 whitespace-nowrap">
          {totalCount > 0 ? `${currentCount}/${totalCount}` : '0/0'}
        </span>
      )}

      {/* Navigation Arrows */}
      <div className="flex items-center gap-0.5 border-l border-[#E8D8C8] dark:border-[#2E2722] pl-1.5 ml-0.5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={totalCount <= 1}
          className="p-1 rounded-md text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous match (Shift+Enter)"
          aria-label="Previous match"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={totalCount <= 1}
          className="p-1 rounded-md text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next match (Enter)"
          aria-label="Next match"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-md transition-colors ml-0.5"
        title="Close search (Esc)"
        aria-label="Close search"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
