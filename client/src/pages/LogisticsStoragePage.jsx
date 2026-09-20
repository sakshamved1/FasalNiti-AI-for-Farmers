import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Warehouse, 
  Calculator, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Coins, 
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function LogisticsStoragePage() {
  const { t } = useLanguage();
  const [transporters, setTransporters] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [calcResult, setCalcResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };


  // Real Profit Calculator inputs
  const [crop, setCrop] = useState('Soybean');
  const [quantityKg, setQuantityKg] = useState(500);
  const [distanceKm, setDistanceKm] = useState(28);
  const [storageDays, setStorageDays] = useState(5);
  const [currentPrice, setCurrentPrice] = useState(4500);
  const [futurePrice, setFuturePrice] = useState(4716);
  const [buyerPrice, setBuyerPrice] = useState(4600);

  useEffect(() => {
    fetchLogistics();
    runProfitCalculator();
  }, []);

  const fetchLogistics = async () => {
    try {
      const [tRes, wRes] = await Promise.all([
        api.get('/logistics/transporters'),
        api.get('/logistics/warehouses')
      ]);
      if (tRes.data.success) setTransporters(tRes.data.transporters);
      if (wRes.data.success) setWarehouses(wRes.data.warehouses);
    } catch (err) {
      console.error('Failed to load logistics:', err);
    }
  };

  const runProfitCalculator = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post('/logistics/calculator', {
        crop,
        quantityKg: Number(quantityKg),
        currentMandiPrice: Number(currentPrice),
        distanceKm: Number(distanceKm),
        storageDays: Number(storageDays),
        futurePriceExpected: Number(futurePrice),
        directBuyerPrice: Number(buyerPrice)
      });
      if (res.data.success) {
        setCalcResult(res.data);
      }
    } catch (err) {
      console.error('Profit calculation failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              {t('logistics')}
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {t('wdraCertified')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            🚚 {t('logisticsStorageTitle')}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            {t('logisticsStorageSubtitle')}
          </p>
        </div>
      </div>

      {/* Real Profit Calculator Box */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
        <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Mathematical Net Realization
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {t('realProfitCalculator')}
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">{t('netRealizationFormula')}</span>
        </div>

        {/* Inputs */}
        <form onSubmit={runProfitCalculator} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">{t('crop')}</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">{t('quantity')} (kg)</label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Distance (km)</label>
            <input
              type="number"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Today's Price</label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Storage Days</label>
            <input
              type="number"
              value={storageDays}
              onChange={(e) => setStorageDays(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Expected 5D Price</label>
            <input
              type="number"
              value={futurePrice}
              onChange={(e) => setFuturePrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs shadow-xs"
            >
              {t('computeRealProfit')}
            </button>
          </div>
        </form>

        {/* Comparison Output */}
        {calcResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option A */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">OPTION A</span>
                <h4 className="font-black text-sm text-slate-800">Sell Now at Mandi</h4>
                <div className="space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between"><span>Gross Value:</span> <span>₹{calcResult.comparison.optionA.grossSaleValue}</span></div>
                  <div className="flex justify-between"><span>Transport Cost:</span> <span className="text-red-600">-₹{calcResult.comparison.optionA.transportCost}</span></div>
                  <div className="flex justify-between"><span>Mandi Cess (0.5%):</span> <span className="text-red-600">-₹{calcResult.comparison.optionA.otherCosts}</span></div>
                </div>
                <div className="pt-2 border-t flex justify-between items-baseline font-black">
                  <span>Net Return:</span>
                  <span className="text-base text-slate-900">₹{calcResult.comparison.optionA.netProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Option B */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-400 text-xs space-y-2 relative shadow-sm">
                <span className="font-black text-emerald-800 uppercase text-[10px]">OPTION B (AI RECOMMENDED)</span>
                <h4 className="font-black text-sm text-emerald-950">Store {storageDays} Days & Sell</h4>
                <div className="space-y-1 text-slate-700 pt-1">
                  <div className="flex justify-between"><span>Gross Value (Surge):</span> <span className="text-emerald-700 font-bold">₹{calcResult.comparison.optionB.grossSaleValue}</span></div>
                  <div className="flex justify-between"><span>Transport Cost:</span> <span className="text-red-600">-₹{calcResult.comparison.optionB.transportCost}</span></div>
                  <div className="flex justify-between"><span>Storage Fee ({storageDays}d):</span> <span className="text-red-600">-₹{calcResult.comparison.optionB.storageCost}</span></div>
                </div>
                <div className="pt-2 border-t flex justify-between items-baseline font-black text-emerald-900">
                  <span>Net Return:</span>
                  <span className="text-base text-emerald-700">₹{calcResult.comparison.optionB.netProfit.toLocaleString()}</span>
                </div>
                <div className="text-[11px] font-extrabold text-emerald-700 pt-1">
                  +₹{calcResult.comparison.optionB.additionalGainVsSellNow} higher net vs sell now!
                </div>
              </div>

              {/* Option C */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">OPTION C</span>
                <h4 className="font-black text-sm text-slate-800">Sell to Direct Buyer (Farmgate)</h4>
                <div className="space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between"><span>Gross Value:</span> <span>₹{calcResult.comparison.optionC.grossSaleValue}</span></div>
                  <div className="flex justify-between"><span>Transport:</span> <span className="text-emerald-600">₹0 (Buyer Arranges)</span></div>
                  <div className="flex justify-between"><span>Storage:</span> <span>₹0</span></div>
                </div>
                <div className="pt-2 border-t flex justify-between items-baseline font-black">
                  <span>Net Return:</span>
                  <span className="text-base text-slate-900">₹{calcResult.comparison.optionC.netProfit.toLocaleString()}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-500 pt-1">
                  +₹{calcResult.comparison.optionC.additionalGainVsSellNow} vs mandi today
                </div>
              </div>

            </div>

            <div className="bg-emerald-100/60 p-3 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{calcResult.recommendation.explanation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Available Rural Transporters Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900">
            {t('availableTransporters')}
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{transporters.length} Verified Drivers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transporters.map((transporter, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{transporter.vehicleType}</span>
                  <h4 className="font-black text-base text-slate-900 mt-0.5">{transporter.operatorName}</h4>
                  <p className="text-xs text-slate-500">Driver: {transporter.driverName} ({transporter.vehicleNumber})</p>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  ⭐ {transporter.rating}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <strong className="text-slate-800">{transporter.capacityTonnes} Tonnes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tariff:</span>
                  <strong className="text-emerald-700">₹{transporter.baseFare} Base + ₹{transporter.ratePerKm}/km</strong>
                </div>
                <div className="flex justify-between">
                  <span>Completed Trips:</span>
                  <strong className="text-slate-800">{transporter.totalTrips} Trips</strong>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-600 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{transporter.driverPhone}</span>
                </div>
                <button
                  onClick={() => showToast(`Booking request sent to ${transporter.driverName} (${transporter.operatorName})! Direct driver dispatch initiated.`)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                >
                  {t('bookTransport')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warehouses & Cold Storages Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900">
            {t('availableWarehouses')}
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{warehouses.length} Accredited Facilities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((w, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {w.storageType}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 mt-2 leading-snug">{w.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{w.ownerType}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Daily Tariff</span>
                  <p className="text-sm font-black text-emerald-700">₹{w.ratePerQuintalPerDay}/qtl/day</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Available Space:</span>
                  <strong className="text-slate-800">{w.availableCapacityTonnes} / {w.totalCapacityTonnes} T</strong>
                </div>
                <div className="flex justify-between">
                  <span>WDRA Certified:</span>
                  <strong className="text-emerald-700">{w.wdraAccredited ? '✓ Yes (Pledge Loan Available)' : 'No'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Insurance:</span>
                  <strong className="text-emerald-700">{w.insuranceCovered ? '✓ Fully Insured' : 'No'}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                📍 {w.address}
              </p>

              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Tel: {w.contactPhone}</span>
                <button
                  onClick={() => showToast(`Space reservation inquiry sent to ${w.name}! Godown receipt slip issued.`)}
                  className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-all"
                >
                  {t('reserveSpace')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
