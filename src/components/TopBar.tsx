'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Sparkles, User, Settings, Edit3 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface TopBarProps {
  isVoiceMode?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isVoiceMode = false }) => {
  const { toggleSidebar, userName, setIsSettingsOpen } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const initialLetter = (userName?.trim() || 'A').charAt(0).toUpperCase();

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8D8C8]">
      {/* Left side: Hamburger + App Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
          className="p-2 -ml-1 text-[#786A5E] hover:text-[#292524] hover:bg-[#F5EBE0] rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[#9C4A1A]/40"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-base font-semibold text-[#292524] hover:bg-[#F5EBE0]/60 rounded-lg transition-colors group"
          >
            <span className="font-serif italic text-2xl sm:text-[28px] font-normal text-[#1C1917] tracking-tight leading-none drop-shadow-xs">
              Zoya
            </span>
            <ChevronDown className="w-4 h-4 text-[#786A5E] group-hover:text-[#292524] transition-transform duration-200" />
          </button>

          {/* Model selection dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-56 p-1.5 bg-[#FFFFFF] border border-[#E8D8C8] rounded-xl shadow-xl shadow-stone-300/40 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-medium text-[#786A5E] border-b border-[#F5EBE0]">
                  Active Engine
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-[#7C3512] bg-[#F5EBE0] hover:bg-[#EFE6DD] rounded-lg mt-1 transition-colors border border-[#E0D0BE]"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9C4A1A]" />
                    <span className="font-semibold text-xs">Zoya Intelligence 2.5</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9C4A1A]/10 text-[#9C4A1A] font-bold">
                    Fast
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: User Profile */}
      <div className="flex items-center gap-2">
        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[1.5px] hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-[#9C4A1A]/40"
            aria-label="User Profile"
          >
            <div className="w-full h-full rounded-full bg-[#FAF6F0] flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-[#7C3512] font-serif">{initialLetter}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#9C4A1A] border-2 border-[#FFFFFF] rounded-full" />
          </button>

          {/* Profile Popover */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 p-2 bg-[#FFFFFF] border border-[#E8D8C8] rounded-2xl shadow-xl shadow-stone-300/40 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-[#F5EBE0] bg-[#FAF6F0] rounded-xl mb-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#1C1917] truncate">{userName || 'Ayush'}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9C4A1A]/10 text-[#9C4A1A] font-bold">
                      Personal
                    </span>
                  </div>
                  <p className="text-[11px] text-[#786A5E] truncate mt-0.5">workspace@zoya.ai</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#574E45] hover:text-[#1C1917] hover:bg-[#FAF6F0] rounded-xl transition-colors text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#9C4A1A]" />
                    <span>Edit Name & Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#574E45] hover:text-[#1C1917] hover:bg-[#FAF6F0] rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#8C7A6B]" />
                    <span>Settings & Personality</span>
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
