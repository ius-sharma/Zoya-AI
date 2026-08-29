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
  Globe,
  Flame,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { LLMProvider, ProviderConfig } from '@/types/chat';
import {
  getStoredConversations,
  saveStoredConversations,
} from '@/utils/storage';

interface ModelOption {
  id: string;
  name: string;
  desc: string;
  speed: string;
}

const PROVIDER_MODELS: Record<LLMProvider, ModelOption[]> = {
  default: [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B (Free)',
      desc: 'Blazing fast 500+ tokens/sec inference with high reasoning',
      speed: 'Instant (Groq Cloud)',
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant (Free)',
      desc: 'Lightweight, ultra-responsive conversational speed',
      speed: '800+ tokens/sec',
    },
  ],
  openai: [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      desc: 'Fast, highly intelligent & cost-effective flagship',
      speed: 'High Speed',
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o Omnimodel',
      desc: 'Most capable multimodal reasoning model from OpenAI',
      speed: 'Deep Reasoning',
    },
    {
      id: 'o3-mini',
      name: 'o3-mini (Reasoning)',
      desc: 'Advanced math, coding, and multi-step logic reasoning',
      speed: 'Step-by-Step Thought',
    },
  ],
  anthropic: [
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      desc: 'Ultra-fast, witty & remarkably articulate conversational intelligence',
      speed: 'Lightning Fast',
    },
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      desc: 'Industry-leading coding, nuances, and human-like natural tone',
      speed: 'Premier Quality',
    },
  ],
  gemini: [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      desc: 'Google Next-Gen multimodal intelligence with real-time speed',
      speed: 'Sub-second Latency',
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      desc: 'Massive 2M token context window and deep analytical research',
      speed: 'Deep Analysis',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      desc: 'Fast and versatile multimodal model for general conversational tasks',
      speed: 'High Speed',
    },
  ],
  groq: [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile',
      desc: 'State-of-the-art open weights with custom Groq LPUs',
      speed: '500+ tokens/sec',
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      desc: 'Extreme response velocity for continuous voice chats',
      speed: '800+ tokens/sec',
    },
  ],
};

const PROVIDER_KEY_LINKS: Record<LLMProvider, { name: string; url: string; prefix: string }> = {
  default: {
    name: 'Free Built-In Engine',
    url: '',
    prefix: '',
  },
  openai: {
    name: 'OpenAI API Keys Dashboard',
    url: 'https://platform.openai.com/api-keys',
    prefix: 'sk-...',
  },
  anthropic: {
    name: 'Anthropic Console',
    url: 'https://console.anthropic.com/settings/keys',
    prefix: 'sk-ant-...',
  },
  gemini: {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/app/apikey',
    prefix: 'AIzaSy...',
  },
  groq: {
    name: 'Groq Cloud Console',
    url: 'https://console.groq.com/keys',
    prefix: 'gsk_...',
  },
};

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

  // LLM Provider & BYOK State
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('default');
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b-versatile');
  const [apiKeys, setApiKeys] = useState<{
    openai: string;
    anthropic: string;
    gemini: string;
    groq: string;
  }>({
    openai: '',
    anthropic: '',
    gemini: '',
    groq: '',
  });
  const [showKey, setShowKey] = useState<boolean>(false);

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

      const savedProviderConfig = localStorage.getItem('zoya_ai_provider_config');
      if (savedProviderConfig) {
        try {
          const config: ProviderConfig = JSON.parse(savedProviderConfig);
          if (config.provider) setSelectedProvider(config.provider);
          if (config.model) setSelectedModel(config.model);
        } catch {
          // ignore
        }
      }

      const savedKeys = localStorage.getItem('zoya_ai_custom_keys');
      if (savedKeys) {
        try {
          const keys = JSON.parse(savedKeys);
          setApiKeys((prev) => ({ ...prev, ...keys }));
        } catch {
          // ignore
        }
      }

      const convos = getStoredConversations();
      setTotalChatsCount(convos.filter((c) => c.messages && c.messages.length > 0).length);
    }
  }, []);

  const handleProviderChange = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    const defaultModelForProvider = PROVIDER_MODELS[provider]?.[0]?.id || 'llama-3.3-70b-versatile';
    setSelectedModel(defaultModelForProvider);
  };

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

      // Save Provider Config
      const currentApiKey =
        selectedProvider === 'openai'
          ? apiKeys.openai
          : selectedProvider === 'anthropic'
          ? apiKeys.anthropic
          : selectedProvider === 'gemini'
          ? apiKeys.gemini
          : selectedProvider === 'groq'
          ? apiKeys.groq
          : undefined;

      const providerConfig: ProviderConfig = {
        provider: selectedProvider,
        apiKey: currentApiKey,
        model: selectedModel,
      };

      localStorage.setItem('zoya_ai_provider_config', JSON.stringify(providerConfig));
      localStorage.setItem('zoya_ai_custom_keys', JSON.stringify(apiKeys));

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

  const currentProviderKey =
    selectedProvider === 'openai'
      ? apiKeys.openai
      : selectedProvider === 'anthropic'
      ? apiKeys.anthropic
      : selectedProvider === 'gemini'
      ? apiKeys.gemini
      : selectedProvider === 'groq'
      ? apiKeys.groq
      : '';

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#12100E] text-[#292524] dark:text-[#FAF6F0] flex flex-col transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#E8D8C8] dark:border-[#2E2722] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6F0] dark:bg-[#26221E] hover:bg-[#F5EBE0] dark:hover:bg-[#2E2722] text-[#7C3512] dark:text-[#FAF6F0] font-semibold text-xs transition-all border border-[#E8D8C8] dark:border-[#38302A] hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
            <span>Back to Chat</span>
          </Link>
          <div className="h-5 w-[1px] bg-[#E8D8C8] dark:bg-[#2E2722]" />
          <div>
            <h1 className="font-bold text-base sm:text-lg text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Settings & Studio</h1>
            <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] hidden sm:block">Personalize your relationship, persona, and LLM API providers with Zoya</p>
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
          <div className="md:col-span-4 lg:col-span-3 space-y-1.5 bg-[#FFFFFF] dark:bg-[#1C1917] p-2.5 rounded-3xl border border-[#E8D8C8] dark:border-[#2E2722] shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'profile'
                  ? 'bg-[#FAF6F0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#FAF6F0] border border-[#E8D8C8] dark:border-[#38302A] shadow-xs'
                  : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FAF6F0] dark:hover:bg-[#241F1C] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
              }`}
            >
              <User className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
              <div className="flex flex-col">
                <span>Profile & Identity</span>
                <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">Name & persona info</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('model')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'model'
                  ? 'bg-[#FAF6F0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#FAF6F0] border border-[#E8D8C8] dark:border-[#38302A] shadow-xs'
                  : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FAF6F0] dark:hover:bg-[#241F1C] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
              <div className="flex flex-col">
                <span>LLM Providers & Keys</span>
                <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">OpenAI, Claude, Gemini, Groq</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'persona'
                  ? 'bg-[#FAF6F0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#FAF6F0] border border-[#E8D8C8] dark:border-[#38302A] shadow-xs'
                  : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FAF6F0] dark:hover:bg-[#241F1C] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#B85D19] dark:text-[#D97706]" />
              <div className="flex flex-col">
                <span>Zoya Personality</span>
                <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">Sidekick, humor & banter</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'voice'
                  ? 'bg-[#FAF6F0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#FAF6F0] border border-[#E8D8C8] dark:border-[#38302A] shadow-xs'
                  : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FAF6F0] dark:hover:bg-[#241F1C] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#D97706]" />
              <div className="flex flex-col">
                <span>Voice & Speech</span>
                <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">Speech rate & audio orb</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'data'
                  ? 'bg-[#FAF6F0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#FAF6F0] border border-[#E8D8C8] dark:border-[#38302A] shadow-xs'
                  : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FAF6F0] dark:hover:bg-[#241F1C] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#8C7A6B] dark:text-[#A89F91]" />
              <div className="flex flex-col">
                <span>Data & Privacy</span>
                <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">Export & history storage</span>
              </div>
            </button>
          </div>

          {/* Right Content Panel */}
          <div className="md:col-span-8 lg:col-span-9 bg-[#FFFFFF] dark:bg-[#1C1917] p-6 sm:p-8 rounded-3xl border border-[#E8D8C8] dark:border-[#2E2722] shadow-sm space-y-6">
            {/* 1. Profile & Identity Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Profile & User Identity</h2>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">Tell Zoya who you are and how she should address you.</p>
                </div>

                {/* Avatar Preview Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A]">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[2px] shadow-md shadow-[#9C4A1A]/20 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-[#FFFFFF] dark:bg-[#181513] flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#7C3512] dark:text-[#FAF6F0] font-serif">{initialLetter}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#FAF6F0]">{userName || 'Ayush'}</h3>
                    <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">
                      Zoya will always greet you as <span className="font-semibold text-[#9C4A1A] dark:text-[#D97706]">"{userName || 'Ayush'}"</span>
                    </p>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                    Your Name / Display Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name (e.g. Ayush)"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#A89F91] dark:placeholder-[#6E645A] text-sm font-semibold focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706] focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
                  />
                  <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                    This name will appear on your top-right avatar and in Zoya's greetings & conversations.
                  </p>
                </div>

                {/* User Bio / Context for Zoya */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                    What should Zoya know about you? (Custom Context)
                  </label>
                  <textarea
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    rows={3}
                    placeholder="e.g. I am a developer building cool products, I prefer concise, witty answers..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#A89F91] dark:placeholder-[#6E645A] text-sm resize-none focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706] focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
                  />
                  <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                    Zoya will keep this context in mind during all text and voice interactions.
                  </p>
                </div>
              </div>
            )}

            {/* 2. LLM Providers & Bring Your Own Key (BYOK) Tab */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Intelligence Engine & LLM Providers (BYOK)</h2>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">
                    Use the free built-in Zoya Cloud engine or connect your own OpenAI, Claude, Gemini, or Groq API keys.
                  </p>
                </div>

                {/* Provider Selector Grid */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                    Select Active AI Provider
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Default Free Groq */}
                    <button
                      type="button"
                      onClick={() => handleProviderChange('default')}
                      className={`p-4 rounded-2xl text-left border transition-all relative ${
                        selectedProvider === 'default'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                          <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Zoya Cloud</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Free
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                        Built-in ultra-fast Groq Llama 3.3/3.1. Zero setup needed.
                      </p>
                    </button>

                    {/* OpenAI ChatGPT */}
                    <button
                      type="button"
                      onClick={() => handleProviderChange('openai')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedProvider === 'openai'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">OpenAI (ChatGPT)</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                        GPT-4o, GPT-4o Mini, o3-mini reasoning models.
                      </p>
                    </button>

                    {/* Anthropic Claude */}
                    <button
                      type="button"
                      onClick={() => handleProviderChange('anthropic')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedProvider === 'anthropic'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Anthropic Claude</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                        Claude 3.5 Sonnet, Claude 3.5 Haiku intelligence.
                      </p>
                    </button>

                    {/* Google Gemini */}
                    <button
                      type="button"
                      onClick={() => handleProviderChange('gemini')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedProvider === 'gemini'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Google Gemini</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                        Gemini 2.0 Flash, Gemini 1.5 Pro multimodal.
                      </p>
                    </button>

                    {/* Custom Groq Key */}
                    <button
                      type="button"
                      onClick={() => handleProviderChange('groq')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedProvider === 'groq'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Personal Groq Key</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                        Use your own personal Groq Cloud API quota.
                      </p>
                    </button>
                  </div>
                </div>

                {/* API Key Configuration Section (when not default) */}
                {selectedProvider !== 'default' && (
                  <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                        <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0] uppercase tracking-wider">
                          Enter your {selectedProvider.toUpperCase()} API Key
                        </h4>
                      </div>
                      {PROVIDER_KEY_LINKS[selectedProvider]?.url && (
                        <a
                          href={PROVIDER_KEY_LINKS[selectedProvider].url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-[#9C4A1A] dark:text-[#D97706] hover:underline"
                        >
                          <span>Get API Key</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={currentProviderKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setApiKeys((prev) => ({
                            ...prev,
                            [selectedProvider]: val,
                          }));
                        }}
                        placeholder={`Paste your ${selectedProvider} API key (${PROVIDER_KEY_LINKS[selectedProvider]?.prefix})`}
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#FFFFFF] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#38302A] text-[#1C1917] dark:text-[#FAF6F0] placeholder-[#A89F91] dark:placeholder-[#6E645A] text-xs font-mono focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706] focus:ring-1 focus:ring-[#9C4A1A]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0]"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                      Your API key is stored securely inside your browser's private local storage. It is never sent to third-party databases.
                    </p>
                  </div>
                )}

                {/* Model Selection for Active Provider */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                    Select Model for {selectedProvider === 'default' ? 'Zoya Cloud' : selectedProvider.toUpperCase()}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROVIDER_MODELS[selectedProvider]?.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all ${
                          selectedModel === m.id
                            ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                            : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">{m.name}</span>
                          <span className="text-[10px] font-semibold text-[#9C4A1A] dark:text-[#D97706] bg-[#9C4A1A]/10 dark:bg-[#B85D19]/20 px-1.5 py-0.5 rounded">
                            {m.speed}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] leading-relaxed">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Zoya Personality Tab */}
            {activeTab === 'persona' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Zoya Companion Persona</h2>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">Tune Zoya's personality, humor, and conversational vibe.</p>
                </div>

                {/* Relationship Mode Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                    Relationship Dynamic
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRelationshipStyle('bestie')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        relationshipStyle === 'bestie'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Witty Bestie</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] leading-relaxed">
                        Playful banter, witty humor, and loyal support like a real friend.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRelationshipStyle('concierge')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        relationshipStyle === 'concierge'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Globe className="w-4 h-4 text-[#B85D19] dark:text-[#D97706]" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Luxury Concierge</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] leading-relaxed">
                        Refined, high-fashion, polite, and sophisticated assistance.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRelationshipStyle('coding')}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        relationshipStyle === 'coding'
                          ? 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#9C4A1A] dark:border-[#D97706] shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#141210] border-[#E8D8C8] dark:border-[#2E2722] hover:border-[#B85D19] dark:hover:border-[#D97706]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Flame className="w-4 h-4 text-[#D97706]" />
                        <span className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6F0]">Tech Sidekick</span>
                      </div>
                      <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] leading-relaxed">
                        Fast, sharp, code-first problem solver with punchy answers.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Language Flow */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                    Language & Conversational Flow
                  </label>
                  <select
                    value={languageStyle}
                    onChange={(e) => setLanguageStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A] text-[#1C1917] dark:text-[#FAF6F0] text-sm font-semibold focus:outline-none focus:border-[#9C4A1A] dark:focus:border-[#D97706]"
                  >
                    <option value="hinglish" className="bg-[#FAF6F0] dark:bg-[#26221E]">Natural Hinglish (Hindi + English blend)</option>
                    <option value="english" className="bg-[#FAF6F0] dark:bg-[#26221E]">Pure English (Warm & Elegant)</option>
                    <option value="hindi" className="bg-[#FAF6F0] dark:bg-[#26221E]">Pure Hindi (Shuddh & Friendly)</option>
                  </select>
                </div>

                {/* Humor Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                      Humor & Banter Intensity
                    </label>
                    <span className="text-xs font-bold text-[#9C4A1A] dark:text-[#D97706]">{humorLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={humorLevel}
                    onChange={(e) => setHumorLevel(Number(e.target.value))}
                    className="w-full accent-[#9C4A1A] dark:accent-[#D97706]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C7A6B] dark:text-[#786A5E]">
                    <span>Subtle & Calm</span>
                    <span>Standard Playful</span>
                    <span>Full Spicy Banter</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Voice & Speech Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Voice & Speech Engine</h2>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">Fine-tune Zoya's voice speed and 2D audio visualizer response.</p>
                </div>

                {/* Speech Rate Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#574E45] dark:text-[#C5B8AB]">
                      Speech Speed Rate
                    </label>
                    <span className="text-xs font-bold text-[#9C4A1A] dark:text-[#D97706]">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-[#9C4A1A] dark:accent-[#D97706]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C7A6B] dark:text-[#786A5E]">
                    <span>0.75x (Gentle)</span>
                    <span>1.0x (Natural)</span>
                    <span>1.5x (Fast)</span>
                  </div>
                </div>

                {/* Auto Listen Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A]">
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Continuous Auto-Listen</h4>
                    <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                      Keep microphone listening seamlessly after Zoya finishes speaking in Voice Mode.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoListen}
                    onChange={(e) => setAutoListen(e.target.checked)}
                    className="w-4 h-4 accent-[#9C4A1A] dark:accent-[#D97706] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 5. Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">Data & Local Privacy</h2>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">Manage your stored conversations and private data.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export Card */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#26221E] border border-[#E8D8C8] dark:border-[#38302A] space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                      <h4 className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0]">Export Chat History</h4>
                    </div>
                    <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                      Download all {totalChatsCount} conversation(s) in clean JSON format.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#FFFFFF] dark:bg-[#141210] hover:bg-[#EFE6DD] dark:hover:bg-[#2E2722] text-[#7C3512] dark:text-[#FAF6F0] border border-[#E0D0BE] dark:border-[#38302A] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON</span>
                    </button>
                  </div>

                  {/* Clear History Card */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#26221E] border border-red-200 dark:border-red-900/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h4 className="text-xs font-bold text-red-700 dark:text-red-400">Clear All History</h4>
                    </div>
                    <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
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
