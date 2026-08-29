'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Sparkles,
  Volume2,
  Cpu,
  ShieldCheck,
  Check,
  Trash2,
  Download,
  Save,
  MessageSquare,
  Globe,
  Flame,
} from 'lucide-react';
import {
  getStoredConversations,
  saveStoredConversations,
} from '@/utils/storage';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'persona' | 'voice' | 'model' | 'data'>('profile');
  const [userName, setUserName] = useState<string>('Ayush');
  const [userBio, setUserBio] = useState<string>('');
  const [relationshipStyle, setRelationshipStyle] = useState<string>('bestie');
  const [languageStyle, setLanguageStyle] = useState<string>('hinglish');
  const [humorLevel, setHumorLevel] = useState<number>(85);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [autoListen, setAutoListen] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [totalChatsCount, setTotalChatsCount] = useState<number>(0);

  // Load stored settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('zoya_ai_user_name');
      if (savedName && savedName.trim()) setUserName(savedName.trim());

      const savedBio = localStorage.getItem('zoya_ai_user_bio');
      if (savedBio) setUserBio(savedBio);

      const savedRel = localStorage.getItem('zoya_ai_persona_style');
      if (savedRel) setRelationshipStyle(savedRel);

      const savedLang = localStorage.getItem('zoya_ai_lang_style');
      if (savedLang) setLanguageStyle(savedLang);

      const savedHumor = localStorage.getItem('zoya_ai_humor_level');
      if (savedHumor) setHumorLevel(Number(savedHumor));

      const savedSpeech = localStorage.getItem('zoya_ai_speech_rate');
      if (savedSpeech) setSpeechRate(Number(savedSpeech));

      const convos = getStoredConversations();
      setTotalChatsCount(convos.filter((c) => c.messages && c.messages.length > 0).length);
    }
  }, []);

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoya_ai_user_name', userName.trim() || 'Ayush');
      localStorage.setItem('zoya_ai_user_bio', userBio.trim());
      localStorage.setItem('zoya_ai_persona_style', relationshipStyle);
      localStorage.setItem('zoya_ai_lang_style', languageStyle);
      localStorage.setItem('zoya_ai_humor_level', humorLevel.toString());
      localStorage.setItem('zoya_ai_speech_rate', speechRate.toString());
      localStorage.setItem('zoya_ai_auto_listen', autoListen ? 'true' : 'false');

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleExportData = () => {
    const convos = getStoredConversations();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(convos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zoya_ai_conversations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to permanently delete all local chat history? This cannot be undone.')) {
      if (typeof window !== 'undefined') {
        saveStoredConversations([]);
        localStorage.removeItem('zoya_ai_active_id');
        setTotalChatsCount(0);
        alert('All chat history cleared.');
      }
    }
  };

  const initialLetter = (userName.trim() || 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#292524] flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8D8C8] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F5EBE0] text-[#7C3512] font-semibold text-xs transition-all border border-[#E8D8C8] hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#9C4A1A]" />
            <span>Back to Chat</span>
          </Link>
          <div className="h-5 w-[1px] bg-[#E8D8C8]" />
          <div>
            <h1 className="font-bold text-base sm:text-lg text-[#1C1917] tracking-tight">Settings & Studio</h1>
            <p className="text-[11px] text-[#786A5E] hidden sm:block">Personalize your relationship, persona, and voice with Zoya</p>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={() => handleSaveAll()}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-gradient-to-r from-[#9C4A1A] via-[#B85D19] to-[#7C3512] hover:from-[#B85D19] hover:to-[#8B3A0F] text-white text-xs font-bold rounded-xl shadow-md shadow-[#9C4A1A]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </header>

      {/* Main Settings Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-1.5 bg-[#FFFFFF] p-2.5 rounded-3xl border border-[#E8D8C8] shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'profile'
                  ? 'bg-[#FAF6F0] text-[#9C4A1A] border border-[#E8D8C8] shadow-xs'
                  : 'text-[#574E45] hover:bg-[#FAF6F0] hover:text-[#1C1917]'
              }`}
            >
              <User className="w-4 h-4 text-[#9C4A1A]" />
              <div className="flex flex-col">
                <span>Profile & Identity</span>
                <span className="text-[10px] text-[#8C7A6B] font-normal">Name & persona info</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'persona'
                  ? 'bg-[#FAF6F0] text-[#9C4A1A] border border-[#E8D8C8] shadow-xs'
                  : 'text-[#574E45] hover:bg-[#FAF6F0] hover:text-[#1C1917]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#B85D19]" />
              <div className="flex flex-col">
                <span>Zoya Personality</span>
                <span className="text-[10px] text-[#8C7A6B] font-normal">Sidekick, humor & banter</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'voice'
                  ? 'bg-[#FAF6F0] text-[#9C4A1A] border border-[#E8D8C8] shadow-xs'
                  : 'text-[#574E45] hover:bg-[#FAF6F0] hover:text-[#1C1917]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#D97706]" />
              <div className="flex flex-col">
                <span>Voice & Speech</span>
                <span className="text-[10px] text-[#8C7A6B] font-normal">Speech rate & audio orb</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('model')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'model'
                  ? 'bg-[#FAF6F0] text-[#9C4A1A] border border-[#E8D8C8] shadow-xs'
                  : 'text-[#574E45] hover:bg-[#FAF6F0] hover:text-[#1C1917]'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#7C3512]" />
              <div className="flex flex-col">
                <span>Intelligence & Groq</span>
                <span className="text-[10px] text-[#8C7A6B] font-normal">Llama 3.3 & streaming</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'data'
                  ? 'bg-[#FAF6F0] text-[#9C4A1A] border border-[#E8D8C8] shadow-xs'
                  : 'text-[#574E45] hover:bg-[#FAF6F0] hover:text-[#1C1917]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#8C7A6B]" />
              <div className="flex flex-col">
                <span>Data & Privacy</span>
                <span className="text-[10px] text-[#8C7A6B] font-normal">Export & history storage</span>
              </div>
            </button>
          </div>

          {/* Right Content Panel */}
          <div className="md:col-span-8 lg:col-span-9 bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E8D8C8] shadow-sm space-y-6">
            {/* 1. Profile & Identity Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">Profile & User Identity</h2>
                  <p className="text-xs text-[#786A5E]">Tell Zoya who you are and how she should address you.</p>
                </div>

                {/* Avatar Preview Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8D8C8]">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[2px] shadow-md shadow-[#9C4A1A]/20 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-[#FFFFFF] flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#7C3512] font-serif">{initialLetter}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">{userName || 'Ayush'}</h3>
                    <p className="text-xs text-[#786A5E]">
                      Zoya will always greet you as <span className="font-semibold text-[#9C4A1A]">"{userName || 'Ayush'}"</span>
                    </p>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45]">
                    Your Name / Display Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name (e.g. Ayush)"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8D8C8] text-[#1C1917] placeholder-[#A89F91] text-sm font-semibold focus:outline-none focus:border-[#9C4A1A] focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
                  />
                  <p className="text-[11px] text-[#786A5E]">
                    This name will appear on your top-right avatar and in Zoya's greetings & conversations.
                  </p>
                </div>

                {/* User Bio / Context for Zoya */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45]">
                    What should Zoya know about you? (Custom Context)
                  </label>
                  <textarea
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    rows={3}
                    placeholder="e.g. I am a software engineer building AI apps, I love clean UI designs and fast banter..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8D8C8] text-[#1C1917] placeholder-[#A89F91] text-sm resize-none focus:outline-none focus:border-[#9C4A1A] focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
                  />
                  <p className="text-[11px] text-[#786A5E]">
                    Zoya will keep this context in mind during all text and voice interactions.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Zoya Personality Tab */}
            {activeTab === 'persona' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">Zoya Companion Persona</h2>
                  <p className="text-xs text-[#786A5E]">Tune Zoya's personality, humor, and conversational vibe.</p>
                </div>

                {/* Relationship Mode Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45]">
                    Relationship Dynamic
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRelationshipStyle('bestie')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        relationshipStyle === 'bestie'
                          ? 'bg-[#FAF6F0] border-[#9C4A1A] shadow-xs'
                          : 'bg-[#FFFFFF] border-[#E8D8C8] hover:border-[#B85D19]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-[#9C4A1A]" />
                        <span className="font-bold text-xs text-[#1C1917]">Witty Bestie</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] leading-relaxed">
                        Playful banter, witty humor, and loyal support like a real friend.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRelationshipStyle('concierge')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        relationshipStyle === 'concierge'
                          ? 'bg-[#FAF6F0] border-[#9C4A1A] shadow-xs'
                          : 'bg-[#FFFFFF] border-[#E8D8C8] hover:border-[#B85D19]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Globe className="w-4 h-4 text-[#B85D19]" />
                        <span className="font-bold text-xs text-[#1C1917]">Luxury Concierge</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] leading-relaxed">
                        Refined, high-fashion, polite, and sophisticated assistance.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRelationshipStyle('coding')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        relationshipStyle === 'coding'
                          ? 'bg-[#FAF6F0] border-[#9C4A1A] shadow-xs'
                          : 'bg-[#FFFFFF] border-[#E8D8C8] hover:border-[#B85D19]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Flame className="w-4 h-4 text-[#D97706]" />
                        <span className="font-bold text-xs text-[#1C1917]">Tech Sidekick</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] leading-relaxed">
                        Fast, sharp, code-first problem solver with punchy answers.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Language Flow */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45]">
                    Language & Conversational Flow
                  </label>
                  <select
                    value={languageStyle}
                    onChange={(e) => setLanguageStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E8D8C8] text-[#1C1917] text-sm font-semibold focus:outline-none focus:border-[#9C4A1A]"
                  >
                    <option value="hinglish">Natural Hinglish (Hindi + English blend)</option>
                    <option value="english">Pure English (Warm & Elegant)</option>
                    <option value="hindi">Pure Hindi (Shuddh & Friendly)</option>
                  </select>
                </div>

                {/* Humor Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#574E45]">
                      Humor & Banter Intensity
                    </label>
                    <span className="text-xs font-bold text-[#9C4A1A]">{humorLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={humorLevel}
                    onChange={(e) => setHumorLevel(Number(e.target.value))}
                    className="w-full accent-[#9C4A1A]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C7A6B]">
                    <span>Subtle & Calm</span>
                    <span>Standard Playful</span>
                    <span>Full Spicy Banter 🔥</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Voice & Speech Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">Voice & Speech Engine</h2>
                  <p className="text-xs text-[#786A5E]">Fine-tune Zoya's voice speed and 2D audio visualizer response.</p>
                </div>

                {/* Speech Rate Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#574E45]">
                      Speech Speed Rate
                    </label>
                    <span className="text-xs font-bold text-[#9C4A1A]">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-[#9C4A1A]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C7A6B]">
                    <span>0.75x (Gentle)</span>
                    <span>1.0x (Natural)</span>
                    <span>1.5x (Fast)</span>
                  </div>
                </div>

                {/* Auto Listen Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8D8C8]">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917]">Continuous Auto-Listen</h4>
                    <p className="text-[11px] text-[#786A5E]">
                      Keep microphone listening seamlessly after Zoya finishes speaking in Voice Mode.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoListen}
                    onChange={(e) => setAutoListen(e.target.checked)}
                    className="w-4 h-4 accent-[#9C4A1A] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. Model & Groq Intelligence Tab */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">Groq Cloud AI Engine</h2>
                  <p className="text-xs text-[#786A5E]">Real-time LLM inference configuration.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8D8C8] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#9C4A1A]" />
                      <div>
                        <h4 className="text-xs font-bold text-[#1C1917]">Active Model</h4>
                        <p className="text-[11px] text-[#786A5E]">Auto-resolved from Groq API</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Connected & Ready
                    </span>
                  </div>
                  <p className="text-xs text-[#574E45] leading-relaxed">
                    Powered by Groq's high-speed inference with dynamic failover support for Llama 3.3 70B & Llama 3.1 8B.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">Data & Local Privacy</h2>
                  <p className="text-xs text-[#786A5E]">Manage your stored conversations and private data.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export Card */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8D8C8] space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#9C4A1A]" />
                      <h4 className="text-xs font-bold text-[#1C1917]">Export Chat History</h4>
                    </div>
                    <p className="text-[11px] text-[#786A5E]">
                      Download all {totalChatsCount} conversation(s) in clean JSON format.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#FFFFFF] hover:bg-[#EFE6DD] text-[#7C3512] border border-[#E0D0BE] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON</span>
                    </button>
                  </div>

                  {/* Clear History Card */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-red-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <h4 className="text-xs font-bold text-red-700">Clear All History</h4>
                    </div>
                    <p className="text-[11px] text-[#786A5E]">
                      Permanently wipe all chats from your browser storage.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearAllData}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
