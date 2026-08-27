'use client';

import React from 'react';
import { BarChart3, FileText, Image as ImageIcon, Code, Lightbulb, HelpCircle } from 'lucide-react';
import { QuickChip } from '@/types/chat';

interface QuickChipsProps {
  onSelectChip: (chip: QuickChip) => void;
  disabled?: boolean;
}

const CHIPS: QuickChip[] = [
  {
    id: 'analyse',
    label: 'Analyse',
    iconName: 'BarChart3',
    prompt: 'Analyse the architectural trade-offs between monolithic and microservice systems.',
  },
  {
    id: 'summaries',
    label: 'Summaries',
    iconName: 'FileText',
    prompt: 'Provide a concise summary of the key principles of quantum computing.',
  },
  {
    id: 'image',
    label: 'Image',
    iconName: 'ImageIcon',
    prompt: 'Describe a cinematic futuristic neon metropolis with deep violet and sapphire lighting accents.',
  },
  {
    id: 'code',
    label: 'Code',
    iconName: 'Code',
    prompt: 'Write an asynchronous retry wrapper with exponential backoff in TypeScript.',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm',
    iconName: 'Lightbulb',
    prompt: 'Brainstorm 5 innovative feature ideas for a real-time voice AI assistant.',
  },
];

export const QuickChips: React.FC<QuickChipsProps> = ({ onSelectChip, disabled = false }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'analyse':
        return <BarChart3 className="w-3.5 h-3.5 text-purple-400" />;
      case 'summaries':
        return <FileText className="w-3.5 h-3.5 text-violet-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'code':
        return <Code className="w-3.5 h-3.5 text-sky-400" />;
      case 'brainstorm':
        return <Lightbulb className="w-3.5 h-3.5 text-indigo-300" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1 flex items-center gap-2">
      {CHIPS.map((chip) => (
        <button
          key={chip.id}
          disabled={disabled}
          onClick={() => onSelectChip(chip)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#15121c] hover:bg-[#201b2b] border border-white/[0.07] hover:border-purple-500/30 text-xs font-medium text-gray-300 hover:text-white transition-all shrink-0 hover:shadow-md hover:shadow-purple-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {getIcon(chip.id)}
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
};
