'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Settings, Cpu, ExternalLink, Sun, Moon, Check, Database, Brain } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface TopBarProps {
  isVoiceMode?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isVoiceMode = false }) => {
  const {
    toggleSidebar,
    userName,
    providerConfig,
    theme,
    setTheme,
    setIsSettingsOpen,
    setIsVaultOpen,
    documents,
    ragEnabled,
    memoryProfile,
    setIsMemoryModalOpen,
  } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);


  const initialLetter = (userName?.trim() || 'A').charAt(0).toUpperCase();

  const providerDisplayName =
    providerConfig?.provider === 'openai'
      ? 'OpenAI ' + (providerConfig.model || 'GPT-4o')
      : providerConfig?.provider === 'anthropic'
      ? 'Claude ' + (providerConfig.model || '3.5 Sonnet')
      : providerConfig?.provider === 'gemini'
      ? 'Gemini ' + (providerConfig.model || '2.0 Flash')
      : providerConfig?.provider === 'groq'
      ? 'Groq ' + (providerConfig.model || 'Custom LPU')
      : 'Zoya Cloud (Free)';

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#FFFFFF]/90 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#E8D8C8] dark:border-[#2E2722] transition-colors duration-200">
      {/* Left side: Hamburger + App Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
          className="p-2 -ml-1 text-[#786A5E] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[#9C4A1A]/40"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-base font-semibold text-[#292524] dark:text-[#FAF6F0] hover:bg-[#F5EBE0]/60 dark:hover:bg-[#26221E]/60 rounded-lg transition-colors group"
          >
            <span className="font-serif italic text-2xl sm:text-[28px] font-normal text-[#1C1917] dark:text-[#FAF6F0] tracking-tight leading-none drop-shadow-xs">
              Zoya
            </span>
            <ChevronDown className="w-4 h-4 text-[#786A5E] dark:text-[#A89F91] group-hover:text-[#292524] dark:group-hover:text-[#FAF6F0] transition-transform duration-200" />
          </button>

          {/* Model selection dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 p-2 bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] rounded-2xl shadow-xl shadow-stone-300/40 dark:shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-semibold text-[#786A5E] dark:text-[#A89F91] border-b border-[#F5EBE0] dark:border-[#26221E]">
                  Active Intelligence Engine
                </div>
                <div className="px-3 py-2.5 my-1 bg-[#FAF6F0] dark:bg-[#26221E] rounded-xl border border-[#E8D8C8] dark:border-[#38302A]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                    <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0] truncate">{providerDisplayName}</span>
                  </div>
                  <p className="text-[10px] text-[#786A5E] dark:text-[#8C7A6B] mt-0.5">
                    {providerConfig?.provider === 'default'
                      ? 'Groq Cloud LPU (Free Tier)'
                      : 'BYOK Custom API Key Active'}
                  </p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#9C4A1A] dark:text-[#D97706] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E] rounded-xl transition-colors mt-1"
                >
                  <span>Configure Providers & Models</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: User Profile with Merged Theme Switcher */}
      <div className="flex items-center gap-2">
        {/* Quick Mini Memory Pill */}
        <button
          onClick={() => setIsMemoryModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF6F0] dark:bg-[#1E1B18] hover:bg-[#F5EBE0] dark:hover:bg-[#2A2420] text-[#7C3512] dark:text-[#E8D8C8] text-xs font-semibold border border-[#E8D8C8] dark:border-[#38302A] transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Open Mini Memory"
        >
          <Brain className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
          <span>Memory</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#9C4A1A]/10 dark:bg-[#D97706]/20 text-[#9C4A1A] dark:text-[#D97706] font-bold">
            {memoryProfile.memories.length}
          </span>
        </button>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[1.5px] hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-[#9C4A1A]/40"
            aria-label="User Profile and Theme"
          >

            <div className="w-full h-full rounded-full bg-[#FAF6F0] dark:bg-[#181513] flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-[#7C3512] dark:text-[#FAF6F0] font-serif">{initialLetter}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#9C4A1A] dark:bg-[#D97706] border-2 border-[#FFFFFF] dark:border-[#141210] rounded-full" />
          </button>

          {/* Profile & Theme Popover Menu */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 p-2.5 bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] rounded-2xl shadow-2xl shadow-stone-400/30 dark:shadow-black/70 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-3 py-2.5 bg-[#FAF6F0] dark:bg-[#26221E] rounded-xl border border-[#E8D8C8] dark:border-[#38302A] mb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#1C1917] dark:text-[#FAF6F0] truncate">{userName || 'Ayush'}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9C4A1A]/10 dark:bg-[#B85D19]/20 text-[#9C4A1A] dark:text-[#D97706] font-bold">
                      Personal
                    </span>
                  </div>
                  <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] truncate mt-0.5">workspace@zoya.ai</p>
                </div>

                {/* Direct Theme Switcher (Merged right in the top-right menu) */}
                <div className="px-1 py-1.5 mb-1.5">
                  <div className="flex items-center justify-between px-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] dark:text-[#786A5E]">
                      Theme Mode
                    </span>
                    <span className="text-[10px] font-bold text-[#9C4A1A] dark:text-[#D97706]">
                      {theme === 'dark' ? 'Dark' : 'Bright'}
                    </span>
                  </div>

                  {/* Segmented Switcher */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF6F0] dark:bg-[#141210] rounded-xl border border-[#E8D8C8] dark:border-[#2E2722]">
                    <button
                      type="button"
                      onClick={(e) => setTheme('light', e)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        theme === 'light'
                          ? 'bg-[#FFFFFF] text-[#9C4A1A] shadow-xs border border-[#E8D8C8]'
                          : 'text-[#786A5E] dark:text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
                      }`}
                    >
                      <Sun className={`w-3.5 h-3.5 transition-transform duration-300 ${theme === 'light' ? 'rotate-0 scale-110' : '-rotate-90 scale-90'}`} />
                      <span>Bright</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => setTheme('dark', e)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-[#26221E] text-[#D97706] shadow-xs border border-[#38302A]'
                          : 'text-[#786A5E] dark:text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
                      }`}
                    >
                      <Moon className={`w-3.5 h-3.5 transition-transform duration-300 ${theme === 'dark' ? 'rotate-0 scale-110' : 'rotate-90 scale-90'}`} />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-[#E8D8C8] dark:bg-[#2E2722] my-1" />

                {/* Navigation Links */}
                <div className="space-y-0.5 pt-0.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsMemoryModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E] rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
                      <span>Mini Memory</span>
                    </div>
                    <span className="text-[10px] text-[#9C4A1A] dark:text-[#D97706] font-bold">
                      {memoryProfile.memories.length} Facts
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsVaultOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E] rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
                      <span>Knowledge Vault</span>
                    </div>
                    <span className="text-[10px] text-[#9C4A1A] dark:text-[#D97706] font-bold">
                      {documents.length} Docs
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E] rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-[#8C7A6B] dark:text-[#A89F91]" />
                      <span>Settings & Profile</span>
                    </div>
                    <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E]">Edit</span>
                  </button>


                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E] rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#8C7A6B] dark:text-[#A89F91]" />
                      <span>Settings Studio</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#8C7A6B] dark:text-[#786A5E]" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
