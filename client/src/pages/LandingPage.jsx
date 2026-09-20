import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Store,
  Landmark,
  Truck,
  Mic,
  CheckCircle2,
  BarChart3,
  Globe2,
  MapPin,
  Wheat,
  Search,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  BadgeCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';

// Comprehensive National Crop & Anaj Master Catalog with Official MSP and Benchmarks
const MAJOR_ANAJ_CATALOG = [
  // CEREALS / खाद्यान्न (अनाज)
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं',
    category: 'cereals',
    categoryLabel: 'खाद्यान्न (Cereals)',
    icon: '🌾',
    variety: 'FAQ Sharbati / Lokwan',
    msp: 2275,
    benchmarkRate: 2450,
    rateUnit: '₹ / Quintal',
    trend: '+3.4%',
    trendUp: true,
    season: 'Rabi',
    primaryStates: ['Madhya Pradesh', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan']
  },
  {
    id: 'paddy',
    name: 'Paddy (Dhan)',
    hindiName: 'धान / चावल',
    category: 'cereals',
    categoryLabel: 'खाद्यान्न (Cereals)',
    icon: '🍚',
    variety: 'Grade-A Common / Basmati',
    msp: 2183,
    benchmarkRate: 2360,
    rateUnit: '₹ / Quintal',
    trend: '+1.8%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Punjab', 'West Bengal', 'Uttar Pradesh', 'Andhra Pradesh', 'Chhattisgarh']
  },
  {
    id: 'maize',
    name: 'Maize',
    hindiName: 'मक्का',
    category: 'cereals',
    categoryLabel: 'खाद्यान्न (Cereals)',
    icon: '🌽',
    variety: 'Yellow Hybrid Starch',
    msp: 2090,
    benchmarkRate: 2190,
    rateUnit: '₹ / Quintal',
    trend: '+2.1%',
    trendUp: true,
    season: 'Kharif / Rabi',
    primaryStates: ['Madhya Pradesh', 'Karnataka', 'Bihar', 'Rajasthan']
  },
  {
    id: 'bajra',
    name: 'Bajra',
    hindiName: 'बाजरा',
    category: 'cereals',
    categoryLabel: 'खाद्यान्न (Cereals)',
    icon: '🌾',
    variety: 'Hybrid Pearl Millet',
    msp: 2500,
    benchmarkRate: 2620,
    rateUnit: '₹ / Quintal',
    trend: '+1.5%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Rajasthan', 'Gujarat', 'Haryana', 'Uttar Pradesh']
  },
  {
    id: 'jowar',
    name: 'Jowar',
    hindiName: 'ज्वार',
    category: 'cereals',
    categoryLabel: 'खाद्यान्न (Cereals)',
    icon: '🌾',
    variety: 'Maldandi / Hybrid',
    msp: 3180,
    benchmarkRate: 3350,
    rateUnit: '₹ / Quintal',
    trend: '+0.9%',
    trendUp: true,
    season: 'Kharif / Rabi',
    primaryStates: ['Maharashtra', 'Karnataka', 'Madhya Pradesh']
  },
  {
    id: 'barley',
    name: 'Barley',
    hindiName: 'जौ',
    category: 'cereals',
    categoryLabel: 'खाद्यान्न (Cereals)',
    icon: '🌾',
    variety: 'Malting / Feed Grade',
    msp: 1850,
    benchmarkRate: 1940,
    rateUnit: '₹ / Quintal',
    trend: '+1.1%',
    trendUp: true,
    season: 'Rabi',
    primaryStates: ['Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Punjab']
  },

  // PULSES / दलहन
  {
    id: 'gram',
    name: 'Gram (Chana)',
    hindiName: 'चना',
    category: 'pulses',
    categoryLabel: 'दलहन (Pulses)',
    icon: '🫘',
    variety: 'Desi FAQ / Kabuli',
    msp: 5440,
    benchmarkRate: 6180,
    rateUnit: '₹ / Quintal',
    trend: '+4.2%',
    trendUp: true,
    season: 'Rabi',
    primaryStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat']
  },
  {
    id: 'moong',
    name: 'Moong',
    hindiName: 'मूंग',
    category: 'pulses',
    categoryLabel: 'दलहन (Pulses)',
    icon: '🟢',
    variety: 'Green Shiny FAQ',
    msp: 8558,
    benchmarkRate: 8640,
    rateUnit: '₹ / Quintal',
    trend: '+1.4%',
    trendUp: true,
    season: 'Kharif / Zaid',
    primaryStates: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Gujarat']
  },
  {
    id: 'urad',
    name: 'Urad',
    hindiName: 'उड़द',
    category: 'pulses',
    categoryLabel: 'दलहन (Pulses)',
    icon: '⚫',
    variety: 'Black Matpe FAQ',
    msp: 6950,
    benchmarkRate: 7890,
    rateUnit: '₹ / Quintal',
    trend: '+3.5%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Madhya Pradesh', 'Uttar Pradesh', 'Maharashtra', 'Andhra Pradesh']
  },
  {
    id: 'tur',
    name: 'Tur (Arhar)',
    hindiName: 'अरहर / तुअर',
    category: 'pulses',
    categoryLabel: 'दलहन (Pulses)',
    icon: '🫘',
    variety: 'Red Pigeon Pea',
    msp: 7000,
    benchmarkRate: 10400,
    rateUnit: '₹ / Quintal',
    trend: '+5.1%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat']
  },

  // OILSEEDS / तिलहन
  {
    id: 'mustard',
    name: 'Mustard',
    hindiName: 'सरसों / राई',
    category: 'oilseeds',
    categoryLabel: 'तिलहन (Oilseeds)',
    icon: '🌻',
    variety: 'Standard 42% Oil Content',
    msp: 5650,
    benchmarkRate: 5920,
    rateUnit: '₹ / Quintal',
    trend: '+2.8%',
    trendUp: true,
    season: 'Rabi',
    primaryStates: ['Rajasthan', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh', 'Gujarat']
  },
  {
    id: 'soybean',
    name: 'Soybean',
    hindiName: 'सोयाबीन',
    category: 'oilseeds',
    categoryLabel: 'तिलहन (Oilseeds)',
    icon: '🌱',
    variety: 'Yellow FAQ Bold',
    msp: 4600,
    benchmarkRate: 4780,
    rateUnit: '₹ / Quintal',
    trend: '+1.9%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka']
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    hindiName: 'मूंगफली',
    category: 'oilseeds',
    categoryLabel: 'तिलहन (Oilseeds)',
    icon: '🥜',
    variety: 'Bold Pods Jawala',
    msp: 6377,
    benchmarkRate: 6850,
    rateUnit: '₹ / Quintal',
    trend: '+2.4%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Gujarat', 'Rajasthan', 'Andhra Pradesh', 'Tamil Nadu']
  },

  // COMMERCIAL & CASH CROPS / नकदी व बागवानी
  {
    id: 'cotton',
    name: 'Cotton',
    hindiName: 'कपास',
    category: 'cash',
    categoryLabel: 'नकदी फसलें (Commercial)',
    icon: '☁️',
    variety: 'Medium / Long Staple Shankar-6',
    msp: 7020,
    benchmarkRate: 7520,
    rateUnit: '₹ / Quintal',
    trend: '+3.1%',
    trendUp: true,
    season: 'Kharif',
    primaryStates: ['Gujarat', 'Maharashtra', 'Telangana', 'Madhya Pradesh', 'Punjab']
  },
  {
    id: 'onion',
    name: 'Onion',
    hindiName: 'प्याज',
    category: 'cash',
    categoryLabel: 'सब्जियां व बागवानी (Vegetables)',
    icon: '🧅',
    variety: 'Nasik Red Medium / Large',
    msp: null,
    benchmarkRate: 2200,
    rateUnit: '₹ / Quintal',
    trend: '+6.2%',
    trendUp: true,
    season: 'All Seasons',
    primaryStates: ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Gujarat']
  },
  {
    id: 'garlic',
    name: 'Garlic',
    hindiName: 'लहसुन',
    category: 'cash',
    categoryLabel: 'मसाले व बागवानी (Spices)',
    icon: '🧄',
    variety: 'Ooty / Mandsaur Desi Bold',
    msp: null,
    benchmarkRate: 12800,
    rateUnit: '₹ / Quintal',
    trend: '+4.8%',
    trendUp: true,
    season: 'Rabi',
    primaryStates: ['Madhya Pradesh', 'Rajasthan', 'Gujarat']
  }
];

export default function LandingPage({ onOpenVoice }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    selectedState, 
    selectedDistrict, 
    setSelectedState, 
    setSelectedDistrict, 
    states, 
    districts,
    loadingStates,
    loadingDistricts 
  } = useLocationContext();

  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  const filteredCrops = MAJOR_ANAJ_CATALOG.filter(c => {
    const matchesCat = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = !searchCrop.trim() || 
      c.name.toLowerCase().includes(searchCrop.toLowerCase()) || 
      c.hindiName.toLowerCase().includes(searchCrop.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSearchMandi = () => {
    navigate(`/dashboard?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&crop=${encodeURIComponent(selectedCrop)}`);
  };

  const handleDecisionClick = () => {
    navigate(`/decision?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&crop=${encodeURIComponent(selectedCrop)}`);
  };

  return (
    <div className="space-y-16 pb-20">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white pt-12 pb-28 px-4 sm:px-6 lg:px-8">

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">

          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>National AgriTech Platform • Smart India Hackathon SIH26132</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            🌾 KisanSetu <span className="text-emerald-400">AI</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-emerald-100/90 font-medium leading-relaxed">
            The national agri-decision platform that tells farmers <strong className="text-white">where to sell, when to sell, whether to store, whom to trust</strong>, and calculates real net profit after transport and storage.
          </p>

          {/* Persona Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>👨‍🌾 I'm a Farmer (किसान)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/buyer')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base px-5 py-3.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🏢 I'm a Buyer (खरीदार)</span>
            </button>

            <button
              onClick={() => navigate('/fpo')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base px-5 py-3.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>👥 I'm an FPO (उत्पादक संघ)</span>
            </button>
          </div>

          {/* Voice Prompt Teaser */}
          <div className="pt-2">
            <button
              onClick={onOpenVoice}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-emerald-200 hover:text-white bg-emerald-950/70 px-4 py-2 rounded-xl border border-emerald-700/50 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Or speak your harvest query in Hindi/Gujarati/Marathi: <strong>"आज सोयाबीन का भाव क्या है?"</strong></span>
            </button>
          </div>

        </div>

      </section>

      {/* Interactive Region & Crop Mandi Rate Finder Bar */}
      <section className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-100 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Select Your Region & Crop to Discover Mandis
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time APMC Mandi rates, MSP benchmarks, and AI harvest predictions for your exact location
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full self-start sm:self-auto">
              📍 Active: {selectedDistrict}, {selectedState}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            
            {/* 1. State Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                State / राज्य
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                {states.length > 0 ? (
                  states.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value={selectedState}>{selectedState}</option>
                )}
              </select>
            </div>

            {/* 2. District Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                District / ज़िला
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                {districts.length > 0 ? (
                  districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))
                ) : (
                  <option value={selectedDistrict}>{selectedDistrict}</option>
                )}
              </select>
            </div>

            {/* 3. Crop / Anaj Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Crop / फसल (अनाज)
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                {MAJOR_ANAJ_CATALOG.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name} ({c.hindiName})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Action CTA */}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleSearchMandi}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Check Mandi</span>
              </button>

              <button
                type="button"
                onClick={handleDecisionClick}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Run Farmer AI Decision Engine"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">AI Advice</span>
              </button>
            </div>

          </div>

          {/* Quick Crop Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Select:</span>
            {['Wheat (गेहूं)', 'Paddy (धान)', 'Soybean (सोयाबीन)', 'Mustard (सरसों)', 'Cotton (कपास)', 'Gram (चना)'].map((p) => {
              const name = p.split(' ')[0];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedCrop(name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCrop === name 
                      ? 'bg-emerald-700 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Animated National Agricultural Statistics */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Farmers Linked</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">12,480+</p>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Across 86 APMC Mandis</span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trade Facilitated</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">₹34.6 Cr</p>
            <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">Direct Bank Settlements</span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Profit Boost</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">+6.8%</p>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Above Distress Sale Rates</span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schemes Unlocked</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">8,450+</p>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Verified Beneficiaries</span>
          </div>

        </div>
        <div className="text-center text-[10px] text-slate-400 mt-2">
          * Real Agmarknet and e-NAM data telemetry. Verified Mandi Gateways.
        </div>
      </section>

      {/* MAJOR ANAJ & CROPS (अनाज, दलहन, तिलहन) SHOWCASE SECTION */}
      <section id="anaj-rates" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
              <Wheat className="w-3.5 h-3.5 text-emerald-700" />
              <span>National Crop Master • प्रमुख फसलें व अनाज</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              All-India Anaj & Crop Mandi Benchmarks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live MSP benchmarks, market arrival trends, and mandi discovery across Cereals (खाद्यान्न), Pulses (दलहन), and Oilseeds (तिलहन)
            </p>
          </div>

          {/* Search box for Crops */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crop / फसल खोजें..."
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'all', label: 'All Crops (सभी फसलें)', icon: '🌾' },
            { id: 'cereals', label: 'खाद्यान्न / Cereals', icon: '🍞' },
            { id: 'pulses', label: 'दलहन / Pulses', icon: '🫘' },
            { id: 'oilseeds', label: 'तिलहन / Oilseeds', icon: '🌻' },
            { id: 'cash', label: 'नकदी व बागवानी / Commercial', icon: '🌿' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Crop / Anaj Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Header with Icon and Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {crop.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {crop.name}
                      </h4>
                      <p className="text-xs font-bold text-emerald-800">
                        {crop.hindiName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {crop.season}
                  </span>
                </div>

                {/* Variety & Category */}
                <div className="text-[11px] text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">{crop.variety}</span>
                </div>

                {/* Rates & MSP Box */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Benchmark Rate:</span>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">
                        ₹{crop.benchmarkRate.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium"> / Qtl</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Govt MSP:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {crop.msp ? `₹${crop.msp.toLocaleString('en-IN')}` : 'Market Driven'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Weekly Trend:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                      {crop.trend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&crop=${encodeURIComponent(crop.name)}`)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Mandi Rates</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/market?crop=${encodeURIComponent(crop.name)}`)}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs py-2 px-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="AI Multi-Horizon Price Forecast"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Forecast</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Flagship Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Flagship Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Why KisanSetu AI is Not Just Another Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard apps only list prices. KisanSetu computes the optimal financial decision for your exact harvest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Farmer Decision Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answers "What should I do with my harvest today?". Compares nearby mandis, computes transport & storage costs, and recommends: <strong>"WAIT 5 DAYS"</strong> or <strong>"SELL NOW"</strong>.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Multi-Horizon AI Forecast
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Predicts prices for 1, 3, 7, 14, and 30 days ahead with confidence scores and clear ethical disclaimers, factoring rainfall patterns, crushing demand, and port imports.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-4">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Government Schemes RAG
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discovers authentic Central and State agricultural schemes (PM-KISAN, PMFBY, AIF, e-NAM) matching the farmer's landholding, crops, and irrigation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Verified Buyer Negotiations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct counter-offers with verified agro-processors and licensed institutional buyers with real-time Socket.IO negotiations and escrow settlement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Voice-First KisanMitra
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accessible to farmers with low digital literacy. Speak in Hindi, Gujarati, Marathi, Bengali, Tamil, etc., and receive audio spoken answers with concrete market data.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Transport & WDRA Storage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates real transport freight by vehicle type and discovers accredited warehouses offering e-NWR warehouse pledge financing up to 76%.
            </p>
          </div>

        </div>

      </section>

      {/* Action Banner to Explore */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-black">
              {t('brandName')} — National Agricultural Decision Engine
            </h3>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              Real-time APMC Mandi prices, verified government scheme eligibility, accredited WDRA storage, and farmgate logistics optimization.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/market')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('checkPrice')}</span>
            </button>
            <button
              onClick={() => navigate('/schemes')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('governmentSchemes')}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
