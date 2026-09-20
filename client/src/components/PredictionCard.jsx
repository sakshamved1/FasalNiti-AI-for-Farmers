import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck,
  BrainCircuit,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import CropSelector from './CropSelector';

export default function PredictionCard({ defaultCrop = 'Soybean' }) {
  const [crop, setCrop] = useState(defaultCrop);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchPrediction();
  }, [crop]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/predictions/${crop}`);
      if (res.data.success) {
        setPrediction(res.data.prediction);
      }
    } catch (err) {
      console.error('Failed to load prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'UP') return <ArrowUp className="w-3.5 h-3.5 text-emerald-600 inline" />;
    if (trend === 'DOWN') return <ArrowDown className="w-3.5 h-3.5 text-red-500 inline" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400 inline" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                AI Price Forecast
              </span>
              <span className="text-xs font-bold text-emerald-600">
                Confidence: {prediction?.confidencePercent || 86}%
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Multi-Horizon Price Projections
            </h3>
          </div>
        </div>

        {/* Crop Switcher */}
        <div className="w-48 sm:w-56">
          <CropSelector
            value={crop}
            onChange={setCrop}
            showLabel={false}
            id="prediction-crop-selector"
          />
        </div>
      </div>

      {prediction ? (
        <div className="space-y-5">
          
          {/* Timeline Projections Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            
            {/* Today */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Today</span>
              <p className="text-lg font-black text-slate-900 mt-1">₹{prediction.currentPrice}</p>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">Base Price</span>
            </div>

            {/* 3 Days */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">In 3 Days</span>
              <p className="text-lg font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                <span>₹{prediction.forecast3d.price}</span>
                {getTrendIcon(prediction.forecast3d.trend)}
              </p>
              <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                +{prediction.forecast3d.percentChange}%
              </span>
            </div>

            {/* 7 Days (Sweet Spot) */}
            <div className="bg-emerald-50/80 p-3 rounded-2xl border-2 border-emerald-500/50 text-center shadow-sm relative overflow-hidden">
              <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded-full">
                AI Sweet Spot
              </span>
              <p className="text-lg font-black text-emerald-950 mt-1 flex items-center justify-center gap-1">
                <span>₹{prediction.forecast7d.price}</span>
                {getTrendIcon(prediction.forecast7d.trend)}
              </p>
              <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                +{prediction.forecast7d.percentChange}%
              </span>
            </div>

            {/* 14 Days */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">In 14 Days</span>
              <p className="text-lg font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                <span>₹{prediction.forecast14d.price}</span>
                {getTrendIcon(prediction.forecast14d.trend)}
              </p>
              <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                +{prediction.forecast14d.percentChange}%
              </span>
            </div>

            {/* 30 Days */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">In 30 Days</span>
              <p className="text-lg font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                <span>₹{prediction.forecast30d.price}</span>
                {getTrendIcon(prediction.forecast30d.trend)}
              </p>
              <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                +{prediction.forecast30d.percentChange}%
              </span>
            </div>

          </div>

          {/* AI Insight Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  AI Harvest Decision Insight
                </h4>
                <p className="text-xs text-amber-950 font-medium mt-1 leading-relaxed">
                  {prediction.aiInsight}
                </p>
              </div>
            </div>
          </div>

          {/* Key Contributing Market Factors */}
          {prediction.factors && prediction.factors.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Why is the price moving? (Key Drivers)
              </span>
              <div className="space-y-1.5">
                {prediction.factors.map((f, i) => (
                  <div key={i} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <span className="font-bold text-slate-800 shrink-0">{f.factorName}:</span>
                    <span className="text-slate-600 text-[11px]">{f.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Ethical Disclaimer */}
          <div className="p-3 bg-slate-100/80 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> {prediction.disclaimer}
            </p>
          </div>

        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 text-sm">
          Loading AI projections...
        </div>
      )}

    </div>
  );
}
