import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Landmark, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Info, 
  X, 
  AlertCircle, 
  ArrowRight, 
  UserCheck,
  MapPin,
  RefreshCw
} from 'lucide-react';
import GovernmentSchemeCard from '../components/GovernmentSchemeCard';
import GovtConnectHelpDesk from '../components/GovtConnectHelpDesk';
import LocationSelector from '../components/LocationSelector';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocationContext } from '../contexts/LocationContext';

export default function GovernmentSchemesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { selectedState, selectedDistrict } = useLocationContext();

  const [activeTab, setActiveTab] = useState('RECOMMENDED'); // 'RECOMMENDED' or 'ALL'
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [disclaimer, setDisclaimer] = useState('');

  // Location-driven state initialized from user profile or active location context
  const [locationState, setLocationState] = useState({
    state: user?.state || user?.profile?.location?.state || selectedState || 'Madhya Pradesh',
    district: user?.district || user?.profile?.location?.district || selectedDistrict || 'Indore',
    village: user?.village || user?.profile?.location?.village || ''
  });

  // "Why am I seeing this?" Modal State
  const [whyModalScheme, setWhyModalScheme] = useState(null);

  // Dynamic Categories
  const categories = [
    'ALL',
    'Income Support',
    'Crop Insurance',
    'Agricultural Credit',
    'Irrigation Support',
    'Solar Agriculture',
    'Soil Health',
    'Warehouse & Infrastructure'
  ];

  // Sync with user profile or active global location
  useEffect(() => {
    if (user?.state) {
      setLocationState({
        state: user.state,
        district: user.district || '',
        village: user.village || ''
      });
    } else if (selectedState) {
      setLocationState(prev => ({
        ...prev,
        state: selectedState,
        district: selectedDistrict || ''
      }));
    }
  }, [user, selectedState, selectedDistrict]);

  useEffect(() => {
    fetchPersonalizedSchemes();
  }, [locationState.state, locationState.district, user]);

  useEffect(() => {
    fetchAllSchemes();
  }, [selectedCategory]);

  const fetchPersonalizedSchemes = async () => {
    if (!locationState.state) {
      setRecommendedSchemes([]);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: user?.name,
        role: user?.role || 'FARMER',
        state: locationState.state,
        district: locationState.district,
        village: locationState.village,
        primaryCrops: user?.farmerDetails?.primaryCrops || [],
        landSizeAcres: user?.farmerDetails?.landSizeAcres || 0,
        landCategory: user?.farmerDetails?.landCategory || 'Small',
        irrigationType: user?.farmerDetails?.irrigationType || 'Rainfed'
      };

      const res = await api.post('/schemes/eligibility', payload);
      if (res.data.success) {
        setRecommendedSchemes(res.data.schemes || []);
        setDisclaimer(res.data.disclaimer || '');
      }
    } catch (err) {
      console.error('Failed to load personalized schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchemes = async () => {
    try {
      const url = selectedCategory === 'ALL' ? '/schemes' : `/schemes?category=${encodeURIComponent(selectedCategory)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setAllSchemes(res.data.schemes || []);
      }
    } catch (err) {
      console.error('Failed to load all schemes:', err);
    }
  };

  const handleLocationChange = (newLoc) => {
    setLocationState(prev => ({
      ...prev,
      state: newLoc.state,
      district: newLoc.district,
      village: newLoc.village !== undefined ? newLoc.village : prev.village
    }));
  };

  // Filter schemes based on search
  const filterList = (list) => {
    return list.filter(item => {
      const scheme = item.scheme || item;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        scheme.schemeName?.toLowerCase().includes(q) ||
        scheme.category?.toLowerCase().includes(q) ||
        scheme.summary?.toLowerCase().includes(q) ||
        scheme.department?.toLowerCase().includes(q)
      );
    });
  };

  const displayedRecommendations = filterList(recommendedSchemes.filter(r => r.potentialEligibility));
  const displayedAll = filterList(allSchemes);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('verifiedGovtInfo')}
              </span>
              {locationState.state && (
                <span className="text-xs text-emerald-200">
                  Targeted for: <strong>{locationState.district ? `${locationState.district}, ` : ''}{locationState.state}</strong>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              🏛️ {t('schemesTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1 max-w-2xl">
              {t('schemesSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/profile"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>{t('updateProfileNow')}</span>
            </Link>
          </div>
        </div>

        {/* Statutory Advisory Banner */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-emerald-200/90 font-medium">
          <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <span>
            {disclaimer || t('statutoryAdvisory')}
          </span>
        </div>
      </div>

      {/* Location Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {t('selectLocationPrompt')}
            </span>
          </div>
          {loading && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t('loading')}
            </span>
          )}
        </div>

        <LocationSelector
          selectedState={locationState.state}
          selectedDistrict={locationState.district}
          selectedVillage={locationState.village}
          onLocationChange={handleLocationChange}
          showVillage={false}
          compact={true}
        />
      </div>

      {/* Tabs: Recommended vs. All Schemes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('RECOMMENDED')}
            className={`flex items-center gap-1.5 pb-2 font-black text-xs sm:text-sm transition-all border-b-2 ${
              activeTab === 'RECOMMENDED'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('recommendedForYou')} ({displayedRecommendations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-1.5 pb-2 font-black text-xs sm:text-sm transition-all border-b-2 ${
              activeTab === 'ALL'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-slate-500" />
            <span>{t('allVerifiedSchemes')} ({allSchemes.length})</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('searchSchemesPlaceholder')}
            className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Filter (Only when browsing all) */}
      {activeTab === 'ALL' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Main Schemes List */}
      {activeTab === 'RECOMMENDED' ? (
        <div>
          {!locationState.state ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                📍
              </div>
              <h3 className="text-base font-black text-slate-900">
                {t('selectLocationPrompt')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select your State and District above to discover current verified state and central government agriculture schemes.
              </p>
            </div>
          ) : displayedRecommendations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                🏛️
              </div>
              <h3 className="text-base font-black text-slate-900 max-w-lg mx-auto">
                {t('noSchemesFoundTitle')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('noSchemesFoundSubtitle')}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  <span>{t('updateProfileNow')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setActiveTab('ALL')}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  <span>{t('searchAllSchemes')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecommendations.map((item) => (
                <div key={item.scheme._id || item.scheme.shortCode} className="relative flex flex-col">
                  {/* Match Score Badge */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {item.matchScore}% Match
                    </span>
                  </div>

                  <GovernmentSchemeCard scheme={item.scheme} matchScore={item.matchScore} />

                  {/* "Why am I seeing this?" Button */}
                  <div className="mt-2 bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t('profileMatch')}</span>
                    <button
                      onClick={() => setWhyModalScheme(item)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t('whyAmISeeingThis')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {displayedAll.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <p className="text-sm font-bold text-slate-700">{t('noDataFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAll.map((s) => (
                <GovernmentSchemeCard key={s._id || s.shortCode} scheme={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* "Why am I seeing this?" Modal */}
      {whyModalScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {t('profileMatch')}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {whyModalScheme.scheme?.schemeName}
                </h3>
                <p className="text-xs text-slate-500">
                  Overall Profile Match: <strong className="text-emerald-700">{whyModalScheme.matchScore}%</strong>
                </p>
              </div>
              <button 
                onClick={() => setWhyModalScheme(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matched Criteria */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Matched Profile Criteria:</span>
              <div className="space-y-1.5">
                {whyModalScheme.matchedRules?.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unmatched / Note Criteria if any */}
            {whyModalScheme.unmatchedRules && whyModalScheme.unmatchedRules.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Requirements to Verify:</span>
                <div className="space-y-1.5">
                  {whyModalScheme.unmatchedRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 p-2 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Disclaimer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 italic">
              <strong>Statutory Note:</strong> {t('statutoryAdvisory')}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setWhyModalScheme(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Grievance Redressal & Help Desk */}
      <GovtConnectHelpDesk />

    </div>
  );
}
