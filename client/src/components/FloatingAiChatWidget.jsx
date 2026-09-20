import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Mic, Bot, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function FloatingAiChatWidget({ onOpenVoice, isOpen = false }) {
  const location = useLocation();
  const { currentLang } = useLanguage();
  const [showBubble, setShowBubble] = useState(true);

  // Do not render on isolated Admin portal pages or when assistant is already open
  if (location.pathname.startsWith('/admin') || isOpen) {
    return null;
  }

  return (
    <aside 
      aria-label="KisanMitra AI Assistant"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Speech Prompt Bubble (Dismissible or Clickable) - Visible on tablet/desktop */}
      {showBubble && (
        <div className="hidden sm:flex relative group bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-200/80 max-w-xs items-center gap-2.5 transition-all hover:scale-102">
          <button
            onClick={onOpenVoice}
            className="text-left flex-1 cursor-pointer"
            title="Click to open KisanMitra AI"
          >
            <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{currentLang === 'hi' ? 'किसान मित्र AI से पूछें' : 'Ask KisanMitra AI'}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black uppercase px-1.5 py-0.2 rounded-full">
                24x7 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mt-0.5">
              {currentLang === 'hi' 
                ? 'मंडी भाव, फसल परामर्श और सरकारी योजनाएं' 
                : 'Mandi rates, crop advisory & schemes'}
            </p>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Dismiss bubble"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Pointer tail towards the button */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white"></div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="kisanmitra-floating-button"
        onClick={onOpenVoice}
        className="relative group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-700/35 hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-108 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-white/90 border border-emerald-400/40 cursor-pointer"
        title="Open KisanMitra AI Assistant (किसान मित्र AI)"
        aria-label="Open KisanMitra AI Assistant"
      >
        {/* Radar ping beacon */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>

        {/* Icon with subtle hover rotate / pulse */}
        <div className="flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        {/* Corner mic badge */}
        <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-emerald-950 border-2 border-white flex items-center justify-center text-amber-300 shadow-xs">
          <Mic className="w-2.5 h-2.5" />
        </div>
      </button>
    </aside>
  );
}
