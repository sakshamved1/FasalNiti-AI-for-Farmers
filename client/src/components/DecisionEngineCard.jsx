import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Truck, 
  Warehouse, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Clock,
  Coins
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import CropSelector from './CropSelector';

export default function DecisionEngineCard({ onDecisionCalculated, prefilledData }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const initialCrop = prefilledData?.crop || user?.farmerDetails?.primaryCrops?.[0] || 'Wheat';
  const initialLocation = prefilledData?.location || (user ? [user.village, user.district, user.state].filter(Boolean).join(', ') : 'Ahmedabad, Gujarat');

  const [crop, setCrop] = useState(initialCrop);
  const [quantity, setQuantity] = useState(prefilledData?.quantity || 500);
  const [grade, setGrade] = useState(prefilledData?.grade || 'Grade A');
  const [urgency, setUrgency] = useState(prefilledData?.urgency || 'Medium');
  const [location, setLocation] = useState(initialLocation || 'Ahmedabad, Gujarat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateDecision();
  }, []);

  const calculateDecision = async (e, customLocation) => {
    if (e) e.preventDefault();
    setLoading(true);

    const activeLoc = customLocation !== undefined ? customLocation : location;
    const cleanLoc = (activeLoc || '').trim();
    const parts = cleanLoc.split(',').map(s => s.trim()).filter(Boolean);
    const parsedDistrict = parts[0] || 'Ahmedabad';
    const parsedState = parts[1] || '';

    try {
      const response = await fetch('/api/decision/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          quantity: Number(quantity),
          grade,
          urgency,
          location: {
            raw: cleanLoc,
            district: parsedDistrict,
            state: parsedState,
            village: user?.village || ''
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.decision);
        if (onDecisionCalculated) onDecisionCalculated(data.decision);
      }
    } catch (err) {
      console.error('Decision calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      
      {/* Flagship Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/40 px-2.5 py-0.5 rounded-full inline-block mb-1">
                AI Decision Intelligence
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {t('whatShouldIDo')}
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                AI evaluates live Mandis, Future Price Forecasts, Transport Tariffs, and Storage Costs to compute maximum Net Profit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-400 text-slate-900 font-extrabold px-3 py-1.5 rounded-xl shadow-sm">
              Live Net Return Formula
            </span>
          </div>
        </div>
      </div>

      {/* Input Parameters Form */}
      <div className="p-6 bg-slate-50/50 border-b border-slate-100">
        <form onSubmit={calculateDecision} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
            <CropSelector
              value={crop}
              onChange={setCrop}
              label={`🌾 ${t('crop')}`}
              showLabel={true}
              id="decision-crop-selector"
            />

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ⚖️ {t('quantity')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="500"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                kg
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              = {(quantity / 100).toFixed(1)} Quintals
            </span>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ✨ {t('grade')}
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Grade A">Grade A (Clean & Bold / 10% Moisture)</option>
              <option value="Grade B">Grade B (Standard Market Quality)</option>
              <option value="Grade C">Grade C (High Moisture / Discolored)</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              📍 {t('location')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ahmedabad, Gujarat or Pune, Maharashtra"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Urgency to Sell */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ⚡ {t('urgency')}
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Low">Low (Can wait & store for higher return)</option>
              <option value="Medium">Medium (Flexible within 7 days)</option>
              <option value="High">High (Need urgent cash within 24h)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculating Net Profit across Mandis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate Best Selling Decision (निर्णय खोजें)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Decision Output Results */}
      {result ? (
        <div className="p-6 space-y-6">
          
          {/* Flagship Verdict Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/70 to-teal-50 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    RECOMMENDED ACTION
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    AI Verified Model
                  </span>
                  {result.query?.farmerLocation && (
                    <span className="text-xs font-extrabold text-slate-700 bg-white/90 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      📍 Evaluated from: {result.query.farmerLocation.district}, {result.query.farmerLocation.state}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-emerald-950 mt-1.5 flex items-center gap-2">
                  <span>💡 {result.flagshipTitle}</span>
                </h3>
                <p className="text-sm font-medium text-emerald-900/90 mt-1 max-w-3xl leading-relaxed">
                  {result.simpleExplanation}
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-emerald-200 shadow-sm text-left sm:text-right w-full sm:w-auto shrink-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Estimated Total Net Profit
                </p>
                <p className="text-2xl font-black text-emerald-700">
                  ₹{result.options[0]?.totalNetProfit?.toLocaleString()}
                </p>
                {result.options[0]?.extraProfitVsSellNow > 0 && (
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">
                    +₹{result.options[0]?.extraProfitVsSellNow} extra vs selling today
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Three Ranked Options Cards */}
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>Detailed Comparison of Top 3 Options</span>
              <span className="text-xs font-semibold text-slate-400 normal-case">(ranked by net earnings)</span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {result.options.map((opt, idx) => (
                <div 
                  key={idx}
                  className={`rounded-2xl p-5 border transition-all ${
                    opt.rank === 1 
                      ? 'bg-gradient-to-b from-emerald-50/60 to-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2.5 mb-3">
                    <span className="font-black text-xs text-slate-800">
                      {opt.badge}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      opt.rank === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {opt.verdictTag}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-base text-slate-900 mb-1">
                    {opt.action}
                  </h5>
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    📍 {opt.destination}
                  </p>

                  <div className="space-y-2 text-xs border-y py-3 mb-4 divide-y divide-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{t('currentPrice')}:</span>
                      <span className="font-bold text-slate-900">₹{opt.currentPrice}/qtl</span>
                    </div>
                    {opt.expectedFuturePrice !== opt.currentPrice && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-600">Expected Price (7d):</span>
                        <span className="font-bold text-emerald-600">₹{opt.expectedFuturePrice}/qtl ↑</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-600">{t('distance')}:</span>
                      <span className="font-semibold text-slate-800">{opt.distanceKm} km</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-600">{t('transportCost')}:</span>
                      <span className="font-semibold text-slate-800">₹{opt.transportCostPerQuintal}/qtl</span>
                    </div>
                    {opt.storageCostPerQuintal > 0 && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-600">{t('storageCost')} (5d):</span>
                        <span className="font-semibold text-amber-700">₹{opt.storageCostPerQuintal}/qtl</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 bg-emerald-50/70 p-2 rounded-lg -mx-1">
                      <span className="font-bold text-emerald-950">Net Return / Qtl:</span>
                      <span className="font-black text-emerald-700 text-sm">₹{opt.netReturnPerQuintal}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Demand: <strong className="text-slate-800">{opt.demand}</strong></span>
                      <span>Risk: <strong className="text-slate-800">{opt.risk}</strong></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>AI Confidence:</span>
                      <span className="font-extrabold text-emerald-600">{opt.confidence}%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg mb-4">
                    "{opt.summary}"
                  </p>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500 font-medium">Total Net Earning:</p>
                    <p className="text-xl font-black text-slate-900">
                      ₹{opt.totalNetProfit?.toLocaleString()}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>{result.disclaimer}</p>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            Click "Calculate Best Selling Decision" to run the AI engine
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Simulates live farmgate net realization (Mandi Spot vs. Warehouse 5-Day Storage vs. Direct Verified Buyer with farmgate pickup).
          </p>
          <button
            onClick={calculateDecision}
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            <span>Run Calculation Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
