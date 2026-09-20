import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Store, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import PriceTrendChart from '../components/PriceTrendChart';
import PredictionCard from '../components/PredictionCard';
import WhatIfSimulator from '../components/WhatIfSimulator';
import LeafletMapView from '../components/LeafletMapView';
import api from '../services/api';


import { useLanguage } from '../contexts/LanguageContext';
import { useLocationContext } from '../contexts/LocationContext';
import { useSearchParams } from 'react-router-dom';
import { CROP_MASTER_LIST } from '../data/cropMaster';

export default function MarketIntelligencePage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { selectedState, selectedDistrict, setSelectedState, setSelectedDistrict, states, districts } = useLocationContext();

  const [prices, setPrices] = useState([]);
  const [searchCrop, setSearchCrop] = useState(searchParams.get('crop') || '');
  const [selectedMandi, setSelectedMandi] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cropParam = searchParams.get('crop');
    if (cropParam) {
      setSearchCrop(cropParam);
    }
    fetchPrices();
  }, [searchParams]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/markets/prices');
      if (res.data.success) {
        setPrices(res.data.prices);
      }
    } catch (err) {
      console.error('Failed to load prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = prices.filter(p => {
    const matchesCrop = !searchCrop || (p.cropName && p.cropName.toLowerCase().includes(searchCrop.toLowerCase()));
    const matchesMandi = selectedMandi === 'All' || (p.marketName && p.marketName.toLowerCase().includes(selectedMandi.toLowerCase()));
    const matchesState = !selectedState || selectedState === 'All' || (p.state && p.state.toLowerCase() === selectedState.toLowerCase());
    return matchesCrop && matchesMandi && matchesState;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Live Mandi Gateway
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> National Agmarknet / e-NAM APMC Network
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            📊 Market Intelligence & Price Dashboard
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Real-time modal trading rates, arrival volumes, and comparative spreads across verified APMC mandis.
          </p>
        </div>

        <button
          onClick={fetchPrices}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            list="market-crops-datalist"
            placeholder="Search crop / anaj (Wheat, Soybean, Mustard, Cotton, Chana, Onion, Garlic)..."
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
          />
          <datalist id="market-crops-datalist">
            {CROP_MASTER_LIST.map(c => (
              <option key={c.id} value={c.name}>{c.hindiName} ({c.category})</option>
            ))}
          </datalist>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* State Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All States (Pan-India)</option>
              {states.length > 0 ? (
                states.map(s => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))
              ) : (
                <option value={selectedState}>{selectedState}</option>
              )}
            </select>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All Districts</option>
              {districts.length > 0 ? (
                districts.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              ) : (
                <option value={selectedDistrict}>{selectedDistrict}</option>
              )}
            </select>
          </div>

          {/* Mandi Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMandi}
              onChange={(e) => setSelectedMandi(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All Mandis</option>
              <option value="Vadodara">Vadodara APMC (Gujarat)</option>
              <option value="Gondal">Gondal APMC (Gujarat)</option>
              <option value="Pune">Pune APMC (Maharashtra)</option>
              <option value="Nashik">Nashik APMC (Maharashtra)</option>
              <option value="Indore">Indore Mandi (MP)</option>
              <option value="Dewas">Dewas Mandi (MP)</option>
              <option value="Ujjain">Ujjain Mandi (MP)</option>
              <option value="Bhopal">Bhopal Mandi (MP)</option>
              <option value="Khanna">Khanna Mandi (Punjab)</option>
              <option value="Azadpur">Azadpur Mandi (Delhi)</option>
              <option value="Kota">Kota Mandi (Rajasthan)</option>
              <option value="Yeshwanthpur">Yeshwanthpur (Karnataka)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Mandi Rate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrices.map((item, idx) => {
          const isPositive = (item.priceChange24h || 0) >= 0;
          return (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {item.variety}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {item.cropName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{item.marketName}</span>
                  </p>
                </div>

                <div className={`flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{item.percentChange24h}%</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Modal Price</span>
                  <span className="text-xl font-black text-slate-900">₹{item.modalPrice}</span>
                  <span className="text-xs text-slate-400"> / qtl</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Range Today</span>
                  <span className="text-xs font-bold text-slate-700">₹{item.minPrice} - ₹{item.maxPrice}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Arrivals: <strong className="text-slate-800">{item.arrivalsTonnes} Tonnes</strong></span>
                <span>Demand: <strong className="text-emerald-600">{item.demandLevel}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Trend Charts & AI Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrendChart />
        <PredictionCard />
      </div>

      {/* Interactive What-If Harvest Simulator */}
      <WhatIfSimulator />

      {/* Geospatial Mandi & Logistics Map */}
      <LeafletMapView />

    </div>
  );
}

