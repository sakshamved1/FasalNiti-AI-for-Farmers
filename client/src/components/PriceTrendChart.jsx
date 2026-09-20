import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { TrendingUp, Calendar, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';
import CropSelector from './CropSelector';

export default function PriceTrendChart({ defaultCrop = 'Wheat', defaultMandi = 'Vadodara Krishi Upaj APMC Mandi' }) {
  const [crop, setCrop] = useState(defaultCrop);
  const [mandi, setMandi] = useState(defaultMandi);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPriceHistory();
  }, [crop, mandi, days]);

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/markets/history?crop=${crop}&market=${mandi}&days=${days}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = (data?.history || []).map(item => ({
    date: item.date?.slice(5) || item.date,
    price: item.modalPrice,
    arrivals: item.arrivals
  }));

  const isPositive = (data?.priceChange24h || 0) >= 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Live Mandi Intelligence
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Agmarknet Gateway
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>{crop} Price Trend & Arrivals</span>
          </h3>
          <p className="text-xs text-slate-500">
            Historical price volatility and mandi arrival volume correlation.
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-48 sm:w-56">
            <CropSelector
              value={crop}
              onChange={setCrop}
              showLabel={false}
              id="chart-crop-selector"
            />
          </div>

          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {mandi && !['Vadodara Krishi Upaj APMC Mandi', 'Pune APMC Market', 'Rajkot APMC Mandi', 'Indore Krishi Upaj Mandi', 'Dewas Mandi', 'Bhopal Karond Mandi'].includes(mandi) && (
              <option value={mandi}>{mandi}</option>
            )}
            <option value="Vadodara Krishi Upaj APMC Mandi">Vadodara APMC (Gujarat)</option>
            <option value="Pune APMC Market">Pune APMC (Maharashtra)</option>
            <option value="Rajkot APMC Mandi">Rajkot APMC (Gujarat)</option>
            <option value="Indore Krishi Upaj Mandi">Indore Mandi (MP)</option>
            <option value="Dewas Mandi">Dewas Mandi (MP)</option>
            <option value="Bhopal Karond Mandi">Bhopal Mandi (MP)</option>
          </select>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setDays(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${days === 7 ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              7D
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-2.5 py-1 rounded-lg transition-all ${days === 30 ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              30D
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Modal Price</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-900">₹{data.modalPrice}</span>
              <span className="text-xs font-medium text-slate-500">/ quintal</span>
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}₹{data.priceChange24h} ({data.percentChange24h}%)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Trading Range</span>
            <div className="text-sm font-bold text-slate-800 mt-1">
              ₹{data.minPrice} - ₹{data.maxPrice}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Min - Max Today</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Daily Arrivals</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {data.arrivalsTonnes} <span className="text-xs font-normal text-slate-500">Tonnes</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Active Demand</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-800">MSP Floor Price</span>
            <div className="text-xl font-black text-emerald-900 mt-0.5">
              {crop === 'Soybean' ? '₹4,892' : (crop === 'Wheat' ? '₹2,275' : '₹5,440')}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Govt Guaranteed</span>
          </div>
        </div>
      )}

      {/* Main Recharts Line Chart */}
      <div className="h-64 sm:h-72 w-full min-w-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Loading interactive price trends...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '0.75rem', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px' 
                }}
                formatter={(value, name) => [
                  `₹${value} / quintal`,
                  'Modal Price'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#059669" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#priceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Source: MP Agricultural Marketing Board (Agmarknet)</span>
        <span>Updated Every 6 Hours</span>
      </div>

    </div>
  );
}
