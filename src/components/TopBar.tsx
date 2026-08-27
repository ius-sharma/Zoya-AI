'use client';

import React, { useState } from 'react';
import { Menu, ChevronDown, Plus, Sparkles, User, Settings, Moon } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface TopBarProps {
  isVoiceMode?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isVoiceMode = false }) => {
  const { toggleSidebar, createNewChat } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.04]">
      {/* Left side: Hamburger + App Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
          className="p-2 -ml-1 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-base font-semibold text-white hover:bg-white/[0.05] rounded-lg transition-colors group"
          >
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent font-bold tracking-tight text-lg">
              Zoya.AI
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform duration-200" />
          </button>

          {/* Model selection dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-56 p-1.5 bg-[#171717] border border-white/[0.08] rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-white/[0.06]">
                  Active Model
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-white bg-orange-500/15 hover:bg-orange-500/20 rounded-lg mt-1 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">Zoya Turbo (Default)</span>
                  </div>
                  <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded font-mono">v2.5</span>
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg mt-1 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    <span>Zoya Reasoning</span>
                  </div>
                  <span className="text-[10px] bg-white/[0.08] text-gray-400 px-1.5 py-0.5 rounded font-mono">Pro</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: New Chat + User Profile */}
      <div className="flex items-center gap-2">
        {!isVoiceMode && (
          <button
            onClick={createNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-full transition-all"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[1.5px] hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            aria-label="User Profile"
          >
            <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden">
              <span className="text-xs font-semibold text-white">Z</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
          </button>

          {/* Profile Popover */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 p-1.5 bg-[#171717] border border-white/[0.08] rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-white">Personal Workspace</p>
                  <p className="text-xs text-gray-400 truncate">user@zoya.ai</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Account Profile</span>
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>Settings & Audio</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
