import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllStates, getDistrictsForState } from '../data/locationMaster';

/**
 * Accessible, Searchable Autocomplete Location Selector for State, District & Village
 * Strict cascading: Districts always belong strictly to the selected state.
 */
export default function LocationSelector({
  selectedState = '',
  selectedDistrict = '',
  selectedVillage = '',
  onLocationChange,
  showVillage = true,
  className = '',
  compact = false
}) {
  const { t } = useLanguage();
  const [states, setStates] = useState(() => getAllStates());
  const [districts, setDistricts] = useState(() => {
    return selectedState ? getDistrictsForState(selectedState).map(d => ({ name: d })) : [];
  });
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // State Dropdown
  const [stateSearch, setStateSearch] = useState(selectedState);
  const [stateOpen, setStateOpen] = useState(false);
  const stateRef = useRef(null);

  // District Dropdown
  const [districtSearch, setDistrictSearch] = useState(selectedDistrict);
  const [districtOpen, setDistrictOpen] = useState(false);
  const districtRef = useRef(null);

  // Village Input
  const [village, setVillage] = useState(selectedVillage);

  // Fetch all Indian States & UTs on mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Update internal searches when props change
  useEffect(() => {
    setStateSearch(selectedState || '');
  }, [selectedState]);

  useEffect(() => {
    setDistrictSearch(selectedDistrict || '');
  }, [selectedDistrict]);

  useEffect(() => {
    setVillage(selectedVillage || '');
  }, [selectedVillage]);

  // Load districts strictly for selectedState
  useEffect(() => {
    if (selectedState) {
      const list = getDistrictsForState(selectedState).map(d => ({ name: d }));
      setDistricts(list);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(e.target)) {
        districtOpen && setDistrictOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [districtOpen]);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const res = await api.get('/locations/states');
      if (res.data.success) {
        setStates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load Indian states:', err);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchDistricts = async (stateName) => {
    setLoadingDistricts(true);
    try {
      const res = await api.get(`/locations/states/${encodeURIComponent(stateName)}/districts`);
      if (res.data.success) {
        setDistricts(res.data.data);
      }
    } catch (err) {
      console.error(`Failed to load districts for ${stateName}:`, err);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const filteredStates = states.filter(s =>
    s.name.toLowerCase().includes((stateSearch || '').toLowerCase())
  );

  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes((districtSearch || '').toLowerCase())
  );

  const handleSelectState = (stateName) => {
    setStateSearch(stateName);
    setStateOpen(false);
    setDistrictSearch(''); // reset district on state change
    if (onLocationChange) {
      onLocationChange({
        state: stateName,
        district: '',
        village: village
      });
    }
  };

  const handleSelectDistrict = (districtName) => {
    setDistrictSearch(districtName);
    setDistrictOpen(false);
    if (onLocationChange) {
      onLocationChange({
        state: selectedState,
        district: districtName,
        village: village
      });
    }
  };

  const handleVillageChange = (val) => {
    setVillage(val);
    if (onLocationChange) {
      onLocationChange({
        state: selectedState,
        district: selectedDistrict,
        village: val
      });
    }
  };

  return (
    <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : showVillage ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 ${className}`}>
      
      {/* 1. STATE SELECTOR */}
      <div className="relative" ref={stateRef}>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('state')} <span className="text-red-500">*</span></span>
        </label>

        <div 
          onClick={() => setStateOpen(true)}
          className={`flex items-center justify-between bg-white border ${stateOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'} rounded-xl px-3 py-2 text-xs cursor-pointer shadow-xs`}
        >
          <input
            type="text"
            className="w-full bg-transparent outline-none font-medium text-slate-900 placeholder:text-slate-400 cursor-pointer"
            placeholder={t('searchState')}
            value={stateSearch}
            onChange={(e) => {
              setStateSearch(e.target.value);
              setStateOpen(true);
            }}
            onFocus={() => setStateOpen(true)}
          />
          <div className="flex items-center gap-1 text-slate-400">
            {loadingStates ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>

        {/* State Autocomplete Dropdown */}
        {stateOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in-50 zoom-in-95">
            <div className="px-2 py-1 text-[10px] uppercase font-black text-slate-400 tracking-wider">
              {filteredStates.length} Indian States & UTs Available
            </div>
            {filteredStates.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching state found
              </div>
            ) : (
              filteredStates.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSelectState(st.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    st.name === selectedState 
                      ? 'bg-emerald-50 text-emerald-900 font-bold' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{st.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {st.type} • {st.districtCount} Dists
                    </span>
                  </div>
                  {st.name === selectedState && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. DISTRICT SELECTOR */}
      <div className="relative" ref={districtRef}>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('district')} <span className="text-red-500">*</span></span>
        </label>

        <div 
          onClick={() => selectedState && setDistrictOpen(true)}
          className={`flex items-center justify-between bg-white border ${
            !selectedState ? 'bg-slate-50 opacity-70 cursor-not-allowed' : districtOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 cursor-pointer' : 'border-slate-200 cursor-pointer'
          } rounded-xl px-3 py-2 text-xs shadow-xs`}
        >
          <input
            type="text"
            disabled={!selectedState}
            className={`w-full bg-transparent outline-none font-medium text-slate-900 placeholder:text-slate-400 ${!selectedState ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            placeholder={selectedState ? t('searchDistrict') : t('selectLocationPrompt')}
            value={districtSearch}
            onChange={(e) => {
              setDistrictSearch(e.target.value);
              setDistrictOpen(true);
            }}
            onFocus={() => selectedState && setDistrictOpen(true)}
          />
          <div className="flex items-center gap-1 text-slate-400">
            {loadingDistricts ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>

        {/* District Autocomplete Dropdown */}
        {districtOpen && selectedState && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in-50 zoom-in-95">
            <div className="px-2 py-1 text-[10px] uppercase font-black text-slate-400 tracking-wider">
              {filteredDistricts.length} Districts in {selectedState}
            </div>
            {filteredDistricts.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching district found
              </div>
            ) : (
              filteredDistricts.map((d) => (
                <div
                  key={d.name}
                  onClick={() => handleSelectDistrict(d.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    d.name === selectedDistrict 
                      ? 'bg-emerald-50 text-emerald-900 font-bold' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">{d.name}</span>
                  {d.name === selectedDistrict && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. VILLAGE / CITY INPUT */}
      {showVillage && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('village')}
          </label>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            placeholder={t('enterVillage')}
            value={village}
            onChange={(e) => handleVillageChange(e.target.value)}
          />
        </div>
      )}

    </div>
  );
}
