import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Search, Globe, ChevronRight } from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getDistrictsForState } from '../data/locationMaster';

export default function LocationModal({ isOpen, onClose }) {
  const { 
    selectedState, 
    selectedDistrict, 
    setLocation, 
    states 
  } = useLocationContext();

  const { t } = useLanguage();

  const [tempState, setTempState] = useState(selectedState);
  const [tempDistrict, setTempDistrict] = useState(selectedDistrict);

  // Sync with active location when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempState(selectedState);
      setTempDistrict(selectedDistrict);
    }
  }, [isOpen, selectedState, selectedDistrict]);

  // Dynamically compute official districts for currently highlighted state
  const availableDistricts = getDistrictsForState(tempState);

  // When tempState changes, ensure tempDistrict belongs to tempState
  const handleStateChange = (newState) => {
    setTempState(newState);
    const districtsForNewState = getDistrictsForState(newState);
    if (districtsForNewState.length > 0) {
      setTempDistrict(districtsForNewState[0]);
    }
  };

  if (!isOpen) return null;

  const handleApply = () => {
    setLocation(tempState, tempDistrict);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <MapPin className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {t('selectLocation') || 'Select Your Agricultural Region'}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {t('locationDesc') || 'Prices, nearby mandis, and schemes will tailor strictly to this region'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Current Selection Pill */}
          <div className="bg-emerald-50 border border-emerald-200/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Active Region:</span>
              <span className="text-sm font-black text-emerald-950">
                {tempDistrict}, {tempState}
              </span>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
              Live Mandi Gateway
            </span>
          </div>

          {/* Step 1: Select State */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>1. State / Union Territory ({states.length} Available)</span>
            </label>
            <select
              value={tempState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
            >
              {states.length > 0 ? (
                states.map(s => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name} ({s.type || 'State'})
                  </option>
                ))
              ) : (
                <option value={tempState}>{tempState}</option>
              )}
            </select>
          </div>

          {/* Step 2: Select District (Strictly for tempState) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>2. District in {tempState} ({availableDistricts.length} Official Districts)</span>
            </label>
            <select
              value={tempDistrict}
              onChange={(e) => setTempDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
            >
              {availableDistricts.length > 0 ? (
                availableDistricts.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              ) : (
                <option value={tempDistrict}>{tempDistrict}</option>
              )}
            </select>
          </div>

          {/* Quick Selection Pills for Major Agri States */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Agri States
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Madhya Pradesh', 'Gujarat', 'Maharashtra', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Karnataka'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStateChange(st)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    tempState === st 
                      ? 'bg-emerald-700 text-white border-emerald-700' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Region ({tempDistrict}, {tempState})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
