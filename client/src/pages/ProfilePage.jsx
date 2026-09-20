import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Sprout, 
  Building2, 
  Users, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Languages, 
  Layers,
  Sparkles,
  ArrowRight,
  Droplets,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LocationSelector from '../components/LocationSelector';
import CropSelector from '../components/CropSelector';
import api from '../services/api';

export default function ProfilePage() {
  const { user, setUser, updateUser } = useAuth();
  const { currentLang, changeLanguage, LANGUAGES } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');

  // Farmer Details
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [pickerCrop, setPickerCrop] = useState('Soybean');
  const [landSizeAcres, setLandSizeAcres] = useState(0);
  const [landCategory, setLandCategory] = useState('Small');
  const [irrigationType, setIrrigationType] = useState('Rainfed');
  const [annualIncome, setAnnualIncome] = useState(0);
  const [kccHolder, setKccHolder] = useState(false);
  const [farmingActivity, setFarmingActivity] = useState('Crop Cultivation');

  // Buyer Details
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler / Processor');
  const [requiredCrops, setRequiredCrops] = useState('');

  // FPO Details
  const [fpoName, setFpoName] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [totalAcreage, setTotalAcreage] = useState(0);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [cropsHandled, setCropsHandled] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setState(user.state || '');
      setDistrict(user.district || '');
      setVillage(user.village || '');
      setPreferredLang(user.preferredLanguage || currentLang || 'en');

      if (user.role === 'FARMER' && user.farmerDetails) {
        setPrimaryCrops((user.farmerDetails.primaryCrops || []).join(', '));
        setLandSizeAcres(user.farmerDetails.landSizeAcres || 0);
        setLandCategory(user.farmerDetails.landCategory || 'Small');
        setIrrigationType(user.farmerDetails.irrigationType || 'Rainfed');
        setAnnualIncome(user.farmerDetails.annualIncome || 0);
        setKccHolder(Boolean(user.farmerDetails.kccHolder));
        setFarmingActivity(user.farmerDetails.farmingActivity || 'Crop Cultivation');
      }

      if (user.role === 'BUYER' && user.buyerDetails) {
        setBusinessName(user.buyerDetails.businessName || '');
        setGstNumber(user.buyerDetails.gstNumber || '');
        setBusinessType(user.buyerDetails.businessType || 'Wholesaler / Processor');
        setRequiredCrops((user.buyerDetails.requiredCrops || []).join(', '));
      }

      if (user.role === 'FPO' && user.fpoDetails) {
        setFpoName(user.fpoDetails.fpoName || '');
        setMemberCount(user.fpoDetails.memberCount || 0);
        setTotalAcreage(user.fpoDetails.totalAcreage || 0);
        setRegistrationNumber(user.fpoDetails.registrationNumber || '');
        setCropsHandled((user.fpoDetails.cropsHandled || []).join(', '));
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 mb-6">Please log in or register to view and edit your profile.</p>
      </div>
    );
  }

  const completion = user.profileCompletion || { percentage: 50, missingFields: [] };

  const handleLocationChange = (loc) => {
    setState(loc.state);
    setDistrict(loc.district);
    setVillage(loc.village);
  };

  const handleLanguageChange = (code) => {
    setPreferredLang(code);
    changeLanguage(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name,
        email,
        state,
        district,
        village,
        preferredLanguage: preferredLang
      };

      if (user.role === 'FARMER') {
        const cropsList = primaryCrops
          .split(',')
          .map(c => c.trim())
          .filter(Boolean);

        payload.farmerDetails = {
          primaryCrops: cropsList,
          landSizeAcres: Number(landSizeAcres) || 0,
          landCategory,
          irrigationType,
          annualIncome: Number(annualIncome) || 0,
          kccHolder: Boolean(kccHolder),
          farmingActivity
        };
      } else if (user.role === 'BUYER') {
        const reqCropsList = requiredCrops
          .split(',')
          .map(c => c.trim())
          .filter(Boolean);

        payload.buyerDetails = {
          businessName,
          gstNumber,
          businessType,
          requiredCrops: reqCropsList
        };
      } else if (user.role === 'FPO') {
        const handledList = cropsHandled
          .split(',')
          .map(c => c.trim())
          .filter(Boolean);

        payload.fpoDetails = {
          fpoName,
          memberCount: Number(memberCount) || 0,
          totalAcreage: Number(totalAcreage) || 0,
          registrationNumber,
          cropsHandled: handledList
        };
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        const freshUser = res.data.user || res.data.data;
        if (typeof updateUser === 'function') {
          updateUser(freshUser);
        } else if (typeof setUser === 'function') {
          setUser(freshUser);
        }
        setSuccessMsg('Profile updated successfully! Personalized recommendations have been refreshed.');
        setTimeout(() => setSuccessMsg(''), 4500);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-inner">
              {name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  {user.role} Account
                </span>
                {user.verified ? (
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-300 font-medium">Verification Pending</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">{name || 'Your Profile'}</h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
                {phone} {email ? `• ${email}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-right sm:min-w-[180px]">
            <span className="text-[10px] uppercase font-bold text-emerald-200">Registered Region</span>
            <p className="text-xs font-black text-white mt-0.5 truncate">
              {district ? `${district}, ${state}` : 'Location Not Set'}
            </p>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="flex items-center gap-1 text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Profile Completion
            </span>
            <span className="text-amber-300 font-black">{completion.percentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${completion.percentage}%` }}
            ></div>
          </div>
          {completion.missingFields && completion.missingFields.length > 0 && (
            <p className="text-[11px] text-amber-200 mt-2 font-medium">
              💡 {completion.recommendationPrompt}
            </p>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-900 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> Basic Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (Login Identifier)
              </label>
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed">
                <Phone className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <span>{phone}</span>
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Verified ID</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preferred Language</span>
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                value={preferredLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label || l.nativeName || l.nativeLabel} ({l.englishName || l.name || l.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location Information (Dynamic Master Data) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Location & Market Mapping
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Used for Mandi & Scheme Recommendations</span>
          </div>

          <LocationSelector
            selectedState={state}
            selectedDistrict={district}
            selectedVillage={village}
            onLocationChange={handleLocationChange}
            showVillage={true}
          />
        </div>

        {/* Section 3: Role-Specific Profile Details */}
        {user.role === 'FARMER' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" /> Agricultural & Farming Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Crops Cultivated <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <CropSelector
                      value={pickerCrop}
                      onChange={setPickerCrop}
                      showLabel={false}
                      id="profile-crop-picker"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!pickerCrop) return;
                      const current = primaryCrops.split(',').map(s => s.trim()).filter(Boolean);
                      if (!current.includes(pickerCrop)) {
                        setPrimaryCrops(current.length > 0 ? `${primaryCrops}, ${pickerCrop}` : pickerCrop);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs shrink-0 self-start"
                  >
                    + Add Crop
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Soybean, Wheat, Cotton"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Selected crops list (type custom crops or select above)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Cultivable Land (Acres) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={landSizeAcres}
                  onChange={(e) => setLandSizeAcres(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farmer Landholding Category
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                  value={landCategory}
                  onChange={(e) => setLandCategory(e.target.value)}
                >
                  <option value="Marginal">Marginal Farmer (&lt; 2.5 Acres)</option>
                  <option value="Small">Small Farmer (2.5 - 5.0 Acres)</option>
                  <option value="Medium">Medium Farmer (5.0 - 10.0 Acres)</option>
                  <option value="Large">Large Farmer (&gt; 10.0 Acres)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Irrigation Facility</span>
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                >
                  <option value="Tube Well">Tube Well / Borewell</option>
                  <option value="Canal">Canal Irrigation</option>
                  <option value="Drip">Drip / Micro Irrigation</option>
                  <option value="Rainfed">Rainfed / Monsoon Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Annual Agri Income (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kisan Credit Card (KCC) Holder</span>
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="kcc"
                      checked={kccHolder === true}
                      onChange={() => setKccHolder(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Yes, Active KCC</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="kcc"
                      checked={kccHolder === false}
                      onChange={() => setKccHolder(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {user.role === 'BUYER' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" /> Business & Commercial Procurement Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Trading Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Registered enterprise name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GSTIN / Mandi License Number
                </label>
                <input
                  type="text"
                  placeholder="15-digit GSTIN or APMC License"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Category
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <option value="Agro Processor / Mill">Agro Processor / Mill</option>
                  <option value="Wholesaler / Trader">Wholesaler / Trader</option>
                  <option value="Exporter">Agri Exporter</option>
                  <option value="Corporate Retailer">Corporate Retailer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crops Seeking for Purchase
                </label>
                <input
                  type="text"
                  placeholder="e.g. Soybean, Wheat, Maize"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={requiredCrops}
                  onChange={(e) => setRequiredCrops(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {user.role === 'FPO' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> FPO / Cooperative Organization Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  FPO Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Registered FPO or Producer Company"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="CIN / Society Registration Number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Member Farmers
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aggregated Land Holding (Acres)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={totalAcreage}
                  onChange={(e) => setTotalAcreage(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Profile...' : 'Save & Update Profile'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
