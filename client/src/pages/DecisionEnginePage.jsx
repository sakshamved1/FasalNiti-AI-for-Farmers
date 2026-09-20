import React from 'react';
import DecisionEngineCard from '../components/DecisionEngineCard';
import WhatIfSimulator from '../components/WhatIfSimulator';
import LeafletMapView from '../components/LeafletMapView';
import { Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DecisionEnginePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              National Decision Framework
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Mathematical Net Profit Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            🧠 {t('decisionEngineTitle')}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            {t('decisionEngineSubtitle')}
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
          <p className="font-bold">Formula Verification:</p>
          <span className="text-[11px] text-emerald-700">Calibrated for Pan-India APMC Mandis</span>
        </div>
      </div>

      {/* Flagship Decision Engine Card */}
      <DecisionEngineCard />

      {/* "What If?" Scenario Simulator */}
      <WhatIfSimulator />

      {/* Map View of Mandis & Storage Locations */}
      <LeafletMapView />

    </div>
  );
}
