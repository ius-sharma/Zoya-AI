'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, Check, Trash2, Volume2, ShieldCheck } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    userName,
    updateUserName,
    conversations,
  } = useChat();

  const [tempName, setTempName] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'voice' | 'data'>('profile');

  useEffect(() => {
    setTempName(userName);
  }, [userName, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      updateUserName(tempName.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zoya_ai_conversations');
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
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsSettingsOpen(false)}
      />

      {/* Modal Card in Luxury Satin Cream */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF6F0] border border-[#E8D8C8] shadow-2xl shadow-stone-400/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D8C8] bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#9C4A1A]/10 flex items-center justify-center border border-[#9C4A1A]/20">
              <Sparkles className="w-4 h-4 text-[#9C4A1A]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1C1917] tracking-tight">Settings & Profile</h2>
              <p className="text-xs text-[#786A5E]">Customize how Zoya addresses you</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-[#786A5E] hover:text-[#1C1917] hover:bg-[#F5EBE0] rounded-xl transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#E8D8C8]/60 bg-[#FAF6F0]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#9C4A1A] text-[#9C4A1A] bg-[#FFFFFF]'
                : 'border-transparent text-[#786A5E] hover:text-[#1C1917]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Name</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'voice'
                ? 'border-[#9C4A1A] text-[#9C4A1A] bg-[#FFFFFF]'
                : 'border-transparent text-[#786A5E] hover:text-[#1C1917]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice & Tone</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'data'
                ? 'border-[#9C4A1A] text-[#9C4A1A] bg-[#FFFFFF]'
                : 'border-transparent text-[#786A5E] hover:text-[#1C1917]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data & Privacy</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 bg-[#FAF6F0] max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveName} className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] shadow-xs">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[2px] shadow-md shadow-[#9C4A1A]/20">
                  <div className="w-full h-full rounded-2xl bg-[#FAF6F0] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#7C3512] font-serif">{initialLetter}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">Your Persona Avatar</h3>
                  <p className="text-xs text-[#786A5E]">
                    Zoya will recognize you as <span className="font-semibold text-[#9C4A1A]">{tempName || 'Ayush'}</span>
                  </p>
                </div>
              </div>

              {/* Name Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45]">
                  Your Display Name (What should Zoya call you?)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name (e.g. Ayush)"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E8D8C8] text-[#1C1917] placeholder-[#A89F91] text-sm font-medium focus:outline-none focus:border-[#9C4A1A] focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#786A5E]">
                  Zoya will use this name in greetings, friendly chats, and voice conversations.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9C4A1A] via-[#B85D19] to-[#7C3512] hover:from-[#B85D19] hover:to-[#8B3A0F] text-white text-xs font-bold rounded-xl shadow-md shadow-[#9C4A1A]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Name</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917]">Zoya Personality Style</h4>
                    <p className="text-[11px] text-[#786A5E]">Witty & Caring Best Friend (Hinglish/English)</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-[#9C4A1A]/10 text-[#9C4A1A] border border-[#9C4A1A]/20">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] space-y-2">
                <h4 className="text-xs font-bold text-[#1C1917]">Speech Synthesis Voice</h4>
                <p className="text-[11px] text-[#786A5E]">
                  Continuous Web Audio with Indian/English natural speech and fluid 2D disc response.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917]">Saved Conversations</h4>
                  <p className="text-[11px] text-[#786A5E]">
                    {conversations.filter((c) => c.messages?.length > 0).length} conversation(s) stored locally
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <p className="text-[11px] text-[#786A5E] px-1">
                All conversations are stored locally on your device in Private Storage. No user data is sold or shared.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8D8C8] bg-[#FFFFFF] flex items-center justify-between">
          <span className="text-[11px] text-[#786A5E]">Zoya AI Core 2.5</span>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-[#574E45] hover:text-[#1C1917] hover:bg-[#F5EBE0] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
