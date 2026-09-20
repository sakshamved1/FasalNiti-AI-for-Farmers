import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, TrendingUp, Landmark, Mic } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MobileBottomNav({ onOpenVoice }) {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('dashboard') },
    { to: '/decision', icon: Sparkles, label: t('decisionEngine') || 'AI' },
    { to: '/market', icon: TrendingUp, label: t('mandiPrices') },
    { to: '/schemes', icon: Landmark, label: t('governmentSchemes') }
  ];

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[60px] text-center">{item.label}</span>
          </Link>
        );
      })}

      {/* Floating Center Voice Button */}
      <button
        onClick={onOpenVoice}
        className="-mt-5 w-13 h-13 p-3 bg-gradient-to-tr from-emerald-700 to-emerald-500 rounded-full text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-white"
        title="KisanMitra Voice Assistant"
      >
        <Mic className="w-6 h-6 animate-pulse" />
      </button>

      {navItems.slice(2, 4).map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[60px] text-center">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
