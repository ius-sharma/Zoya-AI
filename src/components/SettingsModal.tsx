'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Sparkles,
  Check,
  Trash2,
  Volume2,
  ShieldCheck,
  Sun,
  Moon,
  Database,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  FileText,
  Brain,
  Plus,
  Download,
  Upload,
  Search,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { MemoryCategory } from '@/types/chat';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    userName,
    updateUserName,
    conversations,
    theme,
    setTheme,
    setIsVaultOpen,
    documents,
    ragEnabled,
    toggleRag,
    purgeAllDocuments,
    memoryProfile,
    removeMemory,
    addMemory,
    clearAllMemories,
    importMemories,
    exportMemories,
  } = useChat();

  const [tempName, setTempName] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'memory' | 'appearance' | 'vault' | 'voice' | 'data'>('profile');

  // Memory Management Studio State
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [memoryCategoryFilter, setMemoryCategoryFilter] = useState<MemoryCategory | 'all'>('all');
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemVal, setNewMemVal] = useState('');
  const [newMemCat, setNewMemCat] = useState<MemoryCategory>('preference');
  const [isAddingMem, setIsAddingMem] = useState(false);
  const [isModalCatOpen, setIsModalCatOpen] = useState(false);
  const [memStatusMessage, setMemStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setTempName(userName);
  }, [userName, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const showMemStatus = (msg: string) => {
    setMemStatusMessage(msg);
    setTimeout(() => setMemStatusMessage(null), 2500);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      updateUserName(tempName.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemKey.trim() && newMemVal.trim()) {
      addMemory(newMemKey.trim(), newMemVal.trim(), newMemCat);
      setNewMemKey('');
      setNewMemVal('');
      setIsAddingMem(false);
      showMemStatus('Memory fact saved successfully');
    }
  };

  const handleExportMemories = () => {
    const jsonStr = exportMemories();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zoya_memory_${userName || 'user'}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showMemStatus('Exported memory JSON file');
  };

  const handleImportMemoriesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importMemories(content);
        if (success) {
          showMemStatus('Memories imported successfully');
        } else {
          showMemStatus('Error importing memory JSON');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllMemories = () => {
    if (window.confirm('Are you sure you want to clear all stored memories for Zoya?')) {
      clearAllMemories();
      showMemStatus('All memories cleared');
    }
  };

  const filteredMemories = memoryProfile.memories.filter((mem) => {
    const matchesSearch =
      mem.key.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
      mem.value.toLowerCase().includes(memorySearchQuery.toLowerCase());
    const matchesCat = memoryCategoryFilter === 'all' || mem.category === memoryCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zoya_ai_conversations_v1');
        localStorage.removeItem('zoya_ai_active_id');
        window.location.reload();
      }
    }
  };

  const initialLetter = (tempName.trim() || 'A').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsSettingsOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF6F0] dark:bg-[#181513] border border-[#E8D8C8] dark:border-[#2E2722] shadow-2xl shadow-stone-400/30 dark:shadow-black/60 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D8C8] dark:border-[#2E2722] bg-[#FFFFFF] dark:bg-[#1C1917]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#9C4A1A]/10 dark:bg-[#B85D19]/15 flex items-center justify-center border border-[#9C4A1A]/20 dark:border-[#B85D19]/30">
              <Sparkles className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Settings & Profile</h2>
              <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">Customize your persona, memory and preferences</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-xl transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#E8D8C8]/60 dark:border-[#2E2722] bg-[#FAF6F0] dark:bg-[#181513] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'profile'
                ? 'border-[#9C4A1A] text-[#9C4A1A] dark:text-[#D97706] bg-[#FFFFFF] dark:bg-[#1C1917]'
                : 'border-transparent text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'memory'
                ? 'border-[#9C4A1A] text-[#9C4A1A] dark:text-[#D97706] bg-[#FFFFFF] dark:bg-[#1C1917]'
                : 'border-transparent text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memory ({memoryProfile.memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'appearance'
                ? 'border-[#9C4A1A] text-[#9C4A1A] dark:text-[#D97706] bg-[#FFFFFF] dark:bg-[#1C1917]'
                : 'border-transparent text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'vault'
                ? 'border-[#9C4A1A] text-[#9C4A1A] dark:text-[#D97706] bg-[#FFFFFF] dark:bg-[#1C1917]'
                : 'border-transparent text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Knowledge Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'voice'
                ? 'border-[#9C4A1A] text-[#9C4A1A] dark:text-[#D97706] bg-[#FFFFFF] dark:bg-[#1C1917]'
                : 'border-transparent text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'data'
                ? 'border-[#9C4A1A] text-[#9C4A1A] dark:text-[#D97706] bg-[#FFFFFF] dark:bg-[#1C1917]'
                : 'border-transparent text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data</span>
          </button>
        </div>


        {/* Content Area */}
        <div className="p-6 space-y-5 bg-[#FAF6F0] dark:bg-[#181513] max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveName} className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] shadow-xs">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[2px] shadow-md shadow-[#9C4A1A]/20">
                  <div className="w-full h-full rounded-2xl bg-[#FAF6F0] dark:bg-[#141210] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#7C3512] dark:text-[#FAF6F0] font-serif">{initialLetter}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#FAF6F0]">Your Persona Avatar</h3>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">
                    Zoya will recognize you as <span className="font-semibold text-[#9C4A1A] dark:text-[#D97706]">{tempName || 'Ayush'}</span>
                  </p>
                </div>
              </div>

              {/* Name Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                  Your Display Name (What should Zoya call you?)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name (e.g. Ayush)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] text-sm text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#9C4A1A]/30 focus:border-[#9C4A1A] transition-all"
                  />
                  {isSaved && (
                    <span className="absolute right-3 top-2.5 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#9C4A1A] hover:bg-[#803810] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#9C4A1A]/20"
              >
                Save Profile
              </button>
            </form>
          )}

          {/* Memory Tab */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              {/* Header Info Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                    <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">
                      Zoya Long-Term Memory
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                    {memoryProfile.memories.length} facts remembered across your conversations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingMem(!isAddingMem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9C4A1A] dark:bg-[#B85D19] hover:bg-[#803810] dark:hover:bg-[#9C4A1A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingMem ? 'Close Form' : 'Add Memory'}</span>
                </button>
              </div>

              {/* Status Message Notification Toast */}
              {memStatusMessage && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>{memStatusMessage}</span>
                </div>
              )}

              {/* Add Memory Form */}
              {isAddingMem && (
                <form
                  onSubmit={handleAddMemory}
                  className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#9C4A1A]/30 dark:border-[#D97706]/30 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">
                      New Memory Fact
                    </span>
                    <span className="text-[10px] text-[#786A5E] dark:text-[#8C7A6B]">
                      Stored locally in browser
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB] mb-1">
                          Fact Key
                        </label>
                        <input
                          type="text"
                          value={newMemKey}
                          onChange={(e) => setNewMemKey(e.target.value)}
                          placeholder="e.g. Favorite Language"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#8C7A6B] focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706]"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB] mb-1">
                          Category
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsModalCatOpen(!isModalCatOpen)}
                            className="w-full h-8 px-3 rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-xs font-semibold text-[#1C1917] dark:text-[#FAF6F0] flex items-center justify-between hover:border-[#9C4A1A]/40 dark:hover:border-[#D97706]/40 transition-all cursor-pointer focus:outline-none"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Tag className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706] shrink-0" />
                              <span className="capitalize">{newMemCat}</span>
                            </div>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-[#8C7A6B] dark:text-[#786A5E] transition-transform duration-200 ${
                                isModalCatOpen ? 'rotate-180 text-[#9C4A1A] dark:text-[#D97706]' : ''
                              }`}
                            />
                          </button>

                          {isModalCatOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsModalCatOpen(false)}
                              />
                              <div className="absolute right-0 left-0 mt-1 p-1 bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] rounded-xl shadow-xl shadow-stone-400/20 dark:shadow-black/70 z-50 animate-in fade-in zoom-in-95 duration-150">
                                {(['preference', 'identity', 'goal', 'fact', 'general'] as const).map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setNewMemCat(cat);
                                      setIsModalCatOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      newMemCat === cat
                                        ? 'bg-[#9C4A1A]/10 dark:bg-[#B85D19]/20 text-[#9C4A1A] dark:text-[#D97706] font-bold'
                                        : 'text-[#574E45] dark:text-[#C5B8AB] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          newMemCat === cat
                                            ? 'bg-[#9C4A1A] dark:bg-[#D97706]'
                                            : 'bg-stone-300 dark:bg-stone-600'
                                        }`}
                                      />
                                      <span className="capitalize">{cat}</span>
                                    </div>
                                    {newMemCat === cat && (
                                      <Check className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706]" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB] mb-1">
                        Detail / Value
                      </label>
                      <input
                        type="text"
                        value={newMemVal}
                        onChange={(e) => setNewMemVal(e.target.value)}
                        placeholder="e.g. TypeScript, Next.js, and Tailwind CSS"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#8C7A6B] focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingMem(false)}
                      className="px-3 py-1.5 text-xs text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#9C4A1A] dark:bg-[#B85D19] hover:bg-[#803810] dark:hover:bg-[#9C4A1A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      Save to Memory
                    </button>
                  </div>
                </form>
              )}

              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memorySearchQuery}
                    onChange={(e) => setMemorySearchQuery(e.target.value)}
                    placeholder="Search remembered facts..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#8C7A6B] focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {(['all', 'preference', 'identity', 'goal', 'fact', 'general'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMemoryCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize shrink-0 transition-all ${
                        memoryCategoryFilter === cat
                          ? 'bg-[#9C4A1A] text-white shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#1C1917] text-[#786A5E] dark:text-[#A89F91] border border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#9C4A1A]/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Items List */}
              <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 pr-1">
                {filteredMemories.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722]">
                    <p className="text-xs text-[#786A5E] dark:text-[#8C7A6B]">
                      {memorySearchQuery || memoryCategoryFilter !== 'all'
                        ? 'No memories match your filter criteria.'
                        : 'No memories saved yet. Click Add Memory above to create one.'}
                    </p>
                  </div>
                ) : (
                  filteredMemories.map((mem) => (
                    <div
                      key={mem.id}
                      className="flex items-start justify-between p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#9C4A1A]/40 transition-colors"
                    >
                      <div className="min-w-0 pr-3 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0] truncate">
                            {mem.key}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-[#FAF6F0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#D97706] font-semibold border border-[#E8D8C8]/60 dark:border-[#38302A]">
                            {mem.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#574E45] dark:text-[#C5B8AB] break-words">
                          {mem.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMemory(mem.id)}
                        className="p-1.5 text-[#8C7A6B] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Data & Privacy Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E8D8C8] dark:border-[#2E2722]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportMemories}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] text-[11px] font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>

                  <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] text-[11px] font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] transition-colors cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Import</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportMemoriesFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {memoryProfile.memories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllMemories}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706] shrink-0" />
                <p className="text-[11px] text-[#574E45] dark:text-[#C5B8AB]">
                  All memories are stored private and local in your browser.
                </p>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Light Mode Card */}
                <button
                  type="button"
                  onClick={(e) => setTheme('light', e)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative ${
                    theme === 'light'
                      ? 'bg-[#FFFFFF] dark:bg-[#1C1917] border-[#9C4A1A] shadow-md ring-1 ring-[#9C4A1A]/30'
                      : 'bg-[#FFFFFF]/70 dark:bg-[#1C1917]/70 border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19]/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F5EBE0] dark:bg-[#26221E] flex items-center justify-center text-[#9C4A1A] dark:text-[#D97706]">
                      <Sun className="w-4 h-4" />
                    </div>
                    {theme === 'light' && (
                      <span className="w-5 h-5 rounded-full bg-[#9C4A1A] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Bright Mode</span>
                  <span className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] mt-0.5">Warm Satin Cream</span>
                </button>

                {/* Dark Mode Card */}
                <button
                  type="button"
                  onClick={(e) => setTheme('dark', e)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative ${
                    theme === 'dark'
                      ? 'bg-[#FFFFFF] dark:bg-[#1C1917] border-[#9C4A1A] shadow-md ring-1 ring-[#9C4A1A]/30'
                      : 'bg-[#FFFFFF]/70 dark:bg-[#1C1917]/70 border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19]/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#26221E] flex items-center justify-center text-[#D97706]">
                      <Moon className="w-4 h-4" />
                    </div>
                    {theme === 'dark' && (
                      <span className="w-5 h-5 rounded-full bg-[#9C4A1A] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Dark Mode</span>
                  <span className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] mt-0.5">Obsidian Espresso</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722]">
                <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                  Theme settings are remembered across all your devices and saved in local storage.
                </p>
              </div>
            </div>
          )}

          {/* Knowledge Vault Tab */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Knowledge Vault Retrieval (RAG)</h4>
                    <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                      Search across your local PDFs, notes, and code files
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleRag}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      ragEnabled
                        ? 'bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 border-[#9C4A1A]/30 dark:border-[#D97706]/30 text-[#9C4A1A] dark:text-[#D97706]'
                        : 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#E8D8C8] dark:border-[#38302A] text-[#786A5E] dark:text-[#8C7A6B]'
                    }`}
                  >
                    {ragEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-[#786A5E] dark:text-[#8C7A6B]" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Indexed Documents</h4>
                  <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                    {documents.length} document(s) • {documents.reduce((acc, d) => acc + d.chunkCount, 0)} chunks ready
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsVaultOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#9C4A1A] hover:bg-[#803810] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Manage Files</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706] shrink-0" />
                <p className="text-[11px] text-[#574E45] dark:text-[#C5B8AB]">
                  <strong>100% Privacy Guarantee:</strong> Your files never leave this machine. Chunks & vectors stay locally in your private workspace.
                </p>
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Zoya Personality Style</h4>
                    <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">Witty & Caring Best Friend (Hinglish/English)</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-[#9C4A1A]/10 dark:bg-[#B85D19]/20 text-[#9C4A1A] dark:text-[#D97706] border border-[#9C4A1A]/20 dark:border-[#B85D19]/30">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] space-y-2">
                <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Speech Synthesis Voice</h4>
                <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                  Continuous Web Audio with Indian/English natural speech and fluid 2D disc response.
                </p>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Saved Conversations</h4>
                  <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                    {conversations.filter((c) => c.messages?.length > 0).length} conversation(s) stored locally
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Purge Knowledge Vault</h4>
                  <p className="text-[11px] text-[#786A5E] dark:text-[#A89F91]">
                    {documents.length} document(s) in local vector store
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete all indexed documents from Knowledge Vault?')) {
                      purgeAllDocuments();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Vault</span>
                </button>
              </div>

              <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] px-1">
                All conversations and documents are stored locally on your device in Private Storage. No user data is sold or shared.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8D8C8] dark:border-[#2E2722] bg-[#FFFFFF] dark:bg-[#1C1917] flex items-center justify-between">
          <span className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">Zoya AI Core 2.5</span>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
