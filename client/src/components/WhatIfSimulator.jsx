import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  ArrowRight,
  Warehouse,
  Truck
} from 'lucide-react';

export default function WhatIfSimulator() {
  const [quantityKg, setQuantityKg] = useState(500);
  const [currentPrice, setCurrentPrice] = useState(4500);
  const [waitDays, setWaitDays] = useState(5);
  const [futurePriceChangePercent, setFuturePriceChangePercent] = useState(4.8);
  const [storageCostPerDay, setStorageCostPerDay] = useState(2.2);
  const [transportCostMultiplier, setTransportCostMultiplier] = useState(1.0); // 1.0 = baseline, 1.2 = +20%
  const [directBuyerPremium, setDirectBuyerPremium] = useState(100); // +₹100 over mandi

  const qtyQuintals = quantityKg / 100;
  const baseTransport = 180 * transportCostMultiplier; // ₹180/qtl baseline

  // Scenario 1: Sell Today at Mandi
  const gross1 = currentPrice * qtyQuintals;
  const net1 = Math.round(gross1 - (baseTransport * qtyQuintals));

  // Scenario 2: Wait & Store (waitDays)
  const futurePrice = Math.round(currentPrice * (1 + futurePriceChangePercent / 100));
  const gross2 = futurePrice * qtyQuintals;
  const totalStorage = Math.round(waitDays * storageCostPerDay * qtyQuintals) + (20 * qtyQuintals); // storage + handling
  const net2 = Math.round(gross2 - (baseTransport * qtyQuintals) - totalStorage);

  // Scenario 3: Sell to Direct Verified Buyer Today (Farmgate Pickup)
  const buyerPrice = currentPrice + directBuyerPremium;
  const gross3 = buyerPrice * qtyQuintals;
  const net3 = gross3; // ZERO transport cost as buyer picks up from farm

  // Scenario 4: Wait 10 Days (Longer Storage)
  const future10dPrice = Math.round(currentPrice * (1 + (futurePriceChangePercent * 1.1) / 100));
  const gross4 = future10dPrice * qtyQuintals;
  const totalStorage10d = Math.round(10 * storageCostPerDay * qtyQuintals) + (25 * qtyQuintals);
  const net4 = Math.round(gross4 - (baseTransport * qtyQuintals) - totalStorage10d);

  // Highest earner
  const outcomes = [
    { label: 'Sell Today at Mandi', net: net1, tag: 'Immediate Cash' },
    { label: `Wait ${waitDays} Days & Store`, net: net2, tag: 'AI Recommended' },
    { label: 'Direct Buyer Farmgate', net: net3, tag: 'Zero Transport' },
    { label: 'Wait 10 Days in Warehouse', net: net4, tag: 'Long Storage' }
  ];

  const highestOutcome = [...outcomes].sort((a, b) => b.net - a.net)[0];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Interactive Decision Sandbox
              </span>
              <span className="text-xs font-semibold text-slate-500">Live Scenario Testing</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              "What If?" Harvest Simulator
            </h3>
          </div>
        </div>

        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold">
          Tested on 500 kg Soybean
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders / Controls */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            Adjust Scenario Variables
          </h4>

          {/* Quantity Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Harvest Quantity:</span>
              <span className="text-emerald-700">{quantityKg} kg ({qtyQuintals} Qtl)</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Wait Days Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>What if I wait:</span>
              <span className="text-emerald-700">{waitDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={waitDays}
              onChange={(e) => setWaitDays(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Expected Price Change */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Expected Price Surge:</span>
              <span className="text-emerald-700">+{futurePriceChangePercent}% (₹{futurePrice}/qtl)</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={futurePriceChangePercent}
              onChange={(e) => setFuturePriceChangePercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Transport Fuel Tariff Multiplier */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Transport Cost Shift:</span>
              <span className="text-emerald-700">{Math.round((transportCostMultiplier - 1) * 100)}% shift</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={transportCostMultiplier}
              onChange={(e) => setTransportCostMultiplier(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">₹{Math.round(baseTransport)}/qtl transport tariff</span>
          </div>

          {/* Direct Buyer Premium */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Buyer Farmgate Premium:</span>
              <span className="text-emerald-700">+₹{directBuyerPremium}/qtl</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="25"
              value={directBuyerPremium}
              onChange={(e) => setDirectBuyerPremium(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Live Scenario Outcomes */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Top Winning Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Highest Estimated Net Return
              </span>
              <h4 className="text-lg font-black mt-0.5">
                🏆 {highestOutcome.label}
              </h4>
              <p className="text-xs text-emerald-100 mt-0.5">
                Estimated Net Payout: <strong>₹{highestOutcome.net.toLocaleString()}</strong> ({highestOutcome.tag})
              </p>
            </div>
            <span className="text-2xl font-black bg-white/20 px-3 py-1.5 rounded-xl">
              ₹{highestOutcome.net.toLocaleString()}
            </span>
          </div>

          {/* Comparative Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Scenario 1 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              highestOutcome.label.includes('Today at Mandi') 
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-sm text-slate-800">1. Sell Today at Mandi</h5>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">Baseline</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">₹{currentPrice}/qtl minus ₹{Math.round(baseTransport)} transport</p>
              <div className="text-xl font-black text-slate-900">
                ₹{net1.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">₹{Math.round(net1 / qtyQuintals)} / qtl net</span>
            </div>

            {/* Scenario 2 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              highestOutcome.label.includes(`Wait ${waitDays} Days`) 
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-sm text-slate-800">2. Wait {waitDays} Days & Store</h5>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">AI Pick</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">₹{futurePrice}/qtl (storage ₹{totalStorage})</p>
              <div className="text-xl font-black text-emerald-700">
                ₹{net2.toLocaleString()}
              </div>
              <span className={`text-[11px] font-bold ${net2 >= net1 ? 'text-emerald-600' : 'text-red-500'}`}>
                {net2 >= net1 ? `+₹${net2 - net1} more` : `-₹${net1 - net2} loss`} vs sell today
              </span>
            </div>

            {/* Scenario 3 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              highestOutcome.label.includes('Direct Buyer') 
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-sm text-slate-800">3. Direct Buyer Farmgate</h5>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Zero Transport</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">₹{buyerPrice}/qtl (Buyer pays transport)</p>
              <div className="text-xl font-black text-slate-900">
                ₹{net3.toLocaleString()}
              </div>
              <span className={`text-[11px] font-bold ${net3 >= net1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                +₹{net3 - net1} more than mandi today
              </span>
            </div>

            {/* Scenario 4 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              highestOutcome.label.includes('Wait 10 Days') 
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-sm text-slate-800">4. Wait 10 Days in Godown</h5>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Extended</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">₹{future10dPrice}/qtl (higher storage ₹{totalStorage10d})</p>
              <div className="text-xl font-black text-slate-900">
                ₹{net4.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">
                ₹{Math.round(net4 / qtyQuintals)} / qtl net
              </span>
            </div>

          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-400 text-center">
            * All simulated values are data-driven estimates based on user slider adjustments and historical seasonal models.
          </div>

        </div>

      </div>

    </div>
  );
}
