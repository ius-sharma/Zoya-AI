'use client';

import React, { useState } from 'react';
import {
  X,
  Brain,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  Search,
  Tag,
  ShieldCheck,
  User,
  Heart,
  Target,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { MemoryCategory, MemoryItem } from '@/types/chat';

export const MemoryManagerModal: React.FC = () => {
  const {
    isMemoryModalOpen,
    setIsMemoryModalOpen,
    memoryProfile,
    addMemory,
    removeMemory,
    clearAllMemories,
    importMemories,
    exportMemories,
    userName,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preference');
  const [isAdding, setIsAdding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isMemoryModalOpen) return null;

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    addMemory(newKey.trim(), newValue.trim(), newCategory);
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
    showStatus('Memory saved successfully');
  };

  const handleExport = () => {
    const jsonStr = exportMemories();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zoya_memory_${userName || 'user'}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStatus('Exported memory JSON file');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importMemories(content);
        if (success) {
          showStatus('Memories imported successfully');
        } else {
          showStatus('Error importing memory JSON');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all stored memories for Zoya?')) {
      clearAllMemories();
      showStatus('All memories cleared');
    }
  };

  const filteredMemories = memoryProfile.memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: MemoryCategory) => {
    switch (category) {
      case 'identity':
        return <User className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />;
      case 'preference':
        return <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'goal':
        return <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'fact':
        return <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#786A5E] dark:text-[#A89F91]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsMemoryModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FAF6F0] dark:bg-[#181513] border border-[#E8D8C8] dark:border-[#2E2722] shadow-2xl shadow-stone-400/30 dark:shadow-black/60 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D8C8] dark:border-[#2E2722] bg-[#FFFFFF] dark:bg-[#1C1917] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#9C4A1A]/10 dark:bg-[#B85D19]/15 flex items-center justify-center border border-[#9C4A1A]/20 dark:border-[#B85D19]/30">
              <Brain className="w-5 h-5 text-[#9C4A1A] dark:text-[#D97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">
                  Mini Memory
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9C4A1A]/10 dark:bg-[#B85D19]/20 text-[#9C4A1A] dark:text-[#D97706]">
                  {memoryProfile.memories.length} Facts Saved
                </span>
              </div>
              <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">
                Zoya remembers your details across conversations locally on this device
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMemoryModalOpen(false)}
            className="p-1.5 text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-xl transition-colors"
            aria-label="Close memory modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-[#FFFFFF]/60 dark:bg-[#1C1917]/60 border-b border-[#E8D8C8]/60 dark:border-[#2E2722] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] dark:text-[#786A5E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9C4A1A] hover:bg-[#803810] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Cancel' : 'Add Memory'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#26221E] hover:bg-[#F5EBE0] dark:hover:bg-[#332D28] text-[#574E45] dark:text-[#C5B8AB] border border-[#E8D8C8] dark:border-[#38302A] text-xs font-semibold rounded-xl cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#26221E] hover:bg-[#F5EBE0] dark:hover:bg-[#332D28] text-[#574E45] dark:text-[#C5B8AB] border border-[#E8D8C8] dark:border-[#38302A] text-xs font-semibold rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 shrink-0 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Add Memory Form Section */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="p-4 bg-[#FFFFFF] dark:bg-[#1C1917] border-b border-[#E8D8C8] dark:border-[#2E2722] space-y-3 shrink-0 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                  Topic / Key
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. Favorite Editor"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-xs text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#9C4A1A]/30"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                  Remembered Fact / Detail
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. VS Code with dark theme"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-xs text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#8C7A6B] focus:outline-none focus:ring-1 focus:ring-[#9C4A1A]/30"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-xs text-[#1C1917] dark:text-[#FAF6F0] focus:outline-none focus:ring-1 focus:ring-[#9C4A1A]/30"
                >
                  <option value="preference">Preference</option>
                  <option value="identity">Identity</option>
                  <option value="goal">Goal</option>
                  <option value="fact">Fact</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#9C4A1A] hover:bg-[#803810] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                Save Memory
              </button>
            </div>
          </form>
        )}

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
          {filteredMemories.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Brain className="w-8 h-8 mx-auto text-[#A89F91] dark:text-[#574E45]" />
              <p className="text-xs font-bold text-[#574E45] dark:text-[#C5B8AB]">
                {searchQuery ? 'No matching memories found' : 'No memories saved yet'}
              </p>
              <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] max-w-sm mx-auto">
                Tell Zoya things like "Mera naam Rahul hai" or "Mujhe coding pasand hai" in chat, or click Add Memory above.
              </p>
            </div>
          ) : (
            filteredMemories.map((mem: MemoryItem) => (
              <div
                key={mem.id}
                className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] shadow-xs group hover:border-[#9C4A1A]/40 dark:hover:border-[#D97706]/40 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8]/60 dark:border-[#38302A] shrink-0">
                    {getCategoryIcon(mem.category)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">
                        {mem.key}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FAF6F0] dark:bg-[#26221E] text-[#786A5E] dark:text-[#A89F91] border border-[#E8D8C8]/50 dark:border-[#38302A]">
                        {mem.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#574E45] dark:text-[#C5B8AB] mt-0.5 break-words font-medium">
                      {mem.value}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeMemory(mem.id)}
                  className="p-1.5 text-[#8C7A6B] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors shrink-0 opacity-80 group-hover:opacity-100"
                  title="Delete memory"
                  aria-label="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8D8C8] dark:border-[#2E2722] bg-[#FFFFFF] dark:bg-[#1C1917] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
            <ShieldCheck className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
            <span>Stored 100% locally on your device</span>
          </div>

          <div className="flex items-center gap-3">
            {memoryProfile.memories.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMemoryModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
