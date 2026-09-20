import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Store, 
  Warehouse, 
  Truck, 
  Landmark, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  Handshake, 
  Mic,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import DecisionEngineCard from '../components/DecisionEngineCard';
import PriceTrendChart from '../components/PriceTrendChart';
import PredictionCard from '../components/PredictionCard';
import HarvestJourney from '../components/HarvestJourney';
import CropQualityAnalyzer from '../components/CropQualityAnalyzer';
import NegotiationPanel from '../components/NegotiationPanel';
import api from '../services/api';

export default function FarmerDashboard({ onOpenVoice }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings');
      if (res.data.success) {
        setListings(res.data.listings);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    }
  };

  const primaryCrop = user?.farmerDetails?.primaryCrops?.[0] || 'Crop';
  const userLoc = user?.district ? `${user.district}, ${user.state || ''}` : (user?.state || '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Top Banner: Real Farmer Identity & Mandi Info */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-forest rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {user ? `${user.role} PORTAL` : 'KISAN PORTAL'}
              </span>
              <span className="text-xs text-emerald-200">
                {userLoc ? `📍 ${userLoc}` : 'National Agricultural Gateway'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {user ? `Namaste, ${user.name}` : 'Namaste, Kisan Bhai'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
              Live APMC mandi pricing, scientific storage options, and verified direct buyers.
            </p>

            {user?.profileCompletion && user.profileCompletion.percentage < 100 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-xl text-xs">
                <span>Profile Completion: <strong>{user.profileCompletion.percentage}%</strong></span>
                <Link to="/profile" className="underline font-bold text-white hover:text-amber-300">
                  Complete Profile →
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenVoice}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{t('talkToKisanMitra')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Hero Card: "TODAY'S BEST DECISION" */}
      <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/80 to-teal-50 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {t('todaysBestDecision')}
              </span>
              <span className="text-xs font-bold text-emerald-800">
                Harvest: {primaryCrop} {userLoc ? `(${userLoc})` : ''}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 pt-1">
              "WAIT 5 DAYS & STORE — Price Surge Expected"
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
              {userLoc ? `${userLoc} Market Intelligence: ` : 'Regional Market Intelligence: '}
              {primaryCrop} prices are projected to rise <strong className="text-emerald-700 font-extrabold">+4.8%</strong> due to local milling and crushing demand. Holding your crop for 5 days yields an estimated <strong className="text-emerald-800 font-black">+₹2,100 extra net profit</strong> after all warehouse storage and transport costs.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-200">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Expected Additional Gain
              </span>
              <p className="text-2xl font-black text-emerald-700">
                +₹2,100
              </p>
            </div>
            <div className="text-right text-[11px] font-bold text-slate-600">
              <span>Confidence: <strong className="text-emerald-600">84%</strong></span> • <span>Risk: <strong className="text-slate-800">Low</strong></span>
            </div>
            <Link
              to="/decision"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1"
            >
              <span>Explore Decision Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* "What do you want to do today?" Large Action Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900">
            What do you want to do today? (आज क्या करना चाहते हैं?)
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Rural Touch Friendly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <Link
            to="/market"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700">
              {t('checkPrice')}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">86 Live Mandis</p>
          </Link>

          <Link
            to="/decision"
            className="bg-white p-4 rounded-2xl border-2 border-emerald-400/80 bg-emerald-50/20 shadow-xs hover:shadow-md transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-xs text-emerald-900">
              Decision Engine
            </h4>
            <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">Best Selling Action</p>
          </Link>

          <Link
            to="/buyers"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-purple-700">
              {t('findBuyer')}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Verified Local Processors</p>
          </Link>

          <Link
            to="/schemes"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Landmark className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-teal-700">
              {t('governmentSchemes')}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">PM-KISAN, PMFBY, AIF</p>
          </Link>

          <Link
            to="/logistics"
            className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-700">
              {t('findTransport')}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Tractors & Mini Trucks</p>
          </Link>


        </div>
      </div>

      {/* Flagship Interactive Decision Engine Component */}
      <DecisionEngineCard />

      {/* Market Intelligence Trends & AI Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrendChart 
          defaultCrop={primaryCrop || 'Wheat'} 
          defaultMandi={user?.district ? `${user.district} APMC Mandi` : 'Central APMC Mandi'} 
        />
        <PredictionCard defaultCrop={primaryCrop || 'Wheat'} />
      </div>

      {/* Harvest Journey Tracker */}
      <HarvestJourney orderData={activeOrder} />

      {/* Live Negotiation Panel */}
      <NegotiationPanel onDealClosed={(order) => setActiveOrder(order)} />

      {/* AI Crop Quality Scanner */}
      <CropQualityAnalyzer />

    </div>
  );
}
