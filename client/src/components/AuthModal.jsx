import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Tractor,
  Store,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Search,
  Copy,
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LocationSelector from './LocationSelector';
import CropSelector from './CropSelector';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, forgotPassword, resetPassword, forgotUsername, loading } = useAuth();
  const { t, currentLang } = useLanguage();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot-password' | 'forgot-username'
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('FARMER');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [landAcres, setLandAcres] = useState(2.5);

  // Forgot Password state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpPayload, setOtpPayload] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Forgot Username / Identifier state
  const [usernameSearchType, setUsernameSearchType] = useState('location'); // 'location' or 'email'
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [foundAccounts, setFoundAccounts] = useState([]);
  const [searchAttempted, setSearchAttempted] = useState(false);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim() || !password) {
      setError(t('enterCredentials') || 'Please enter mobile/email and password.');
      return;
    }

    const res = await login(identifier.trim(), password);
    if (res.success) {
      setSuccess(t('loginSuccess') || 'Logged in successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !regPhone.trim() || !regPassword) {
      setError(t('fillRequiredFields') || 'Please fill name, mobile number and password.');
      return;
    }

    if (!state || !district) {
      setError(t('selectLocationPrompt') || 'Please select your State and District.');
      return;
    }

    const payload = {
      name: name.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      state,
      district,
      village,
      preferredLanguage: currentLang,
      farmerDetails: regRole === 'FARMER' ? {
        landSizeAcres: Number(landAcres) || 2.5,
        landCategory: 'Small',
        primaryCrops: primaryCrop ? [primaryCrop] : ['Wheat']
      } : undefined,
      buyerDetails: regRole === 'BUYER' ? {
        businessName: businessName.trim() || `${name.trim()} Traders`,
        verificationStatus: 'Verified',
        trustScore: 92
      } : undefined
    };

    const res = await register(payload);
    if (res.success) {
      setSuccess(t('registerSuccess') || 'Registration successful! Welcome to FasalNiti.');
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  // Handle Forgot Password - Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recoveryIdentifier.trim()) {
      setError('Please enter your registered mobile number or email address.');
      return;
    }

    const res = await forgotPassword(recoveryIdentifier.trim());
    if (res.success) {
      setOtpSent(true);
      setOtpPayload(res);
      setSuccess('Verification OTP generated successfully!');
    } else {
      setError(res.message || 'Failed to send OTP. Please check identifier.');
    }
  };

  // Handle Forgot Password - Reset with OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recoveryOtp.trim() || recoveryOtp.length < 6) {
      setError('Please enter the 6-digit OTP received.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-type your new password.');
      return;
    }

    const res = await resetPassword(recoveryIdentifier.trim(), recoveryOtp.trim(), newPassword);
    if (res.success) {
      setSuccess('Password reset successfully! Logging you in...');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setError(res.message || 'Failed to reset password. Please check OTP.');
    }
  };

  // Handle Forgot Username - Locate Account
  const handleLocateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFoundAccounts([]);
    setSearchAttempted(true);

    let payload = { searchType: usernameSearchType };
    if (usernameSearchType === 'email') {
      if (!searchEmail.trim()) {
        setError('Please enter your registered email address.');
        return;
      }
      payload.email = searchEmail.trim();
    } else {
      if (!searchName.trim() || searchName.trim().length < 3) {
        setError('Please enter at least 3 characters of your legal full name.');
        return;
      }
      payload.name = searchName.trim();
      payload.state = searchState;
      payload.district = searchDistrict;
    }

    const res = await forgotUsername(payload);
    if (res.success && res.accounts && res.accounts.length > 0) {
      setFoundAccounts(res.accounts);
      setSuccess(`Account located! Found ${res.accounts.length} matching profile(s).`);
    } else {
      setError(res.message || 'No matching account found with provided details.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md sm:max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {mode === 'forgot-password' || mode === 'forgot-username' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                  setOtpSent(false);
                }}
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all mr-1"
                title="Back to Sign In"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                National Agri Marketplace
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {mode === 'login' && (t('signIn') || 'Sign In to FasalNiti')}
                {mode === 'register' && (t('register') || 'Register New Account')}
                {mode === 'forgot-password' && 'Password Recovery (पासवर्ड रीसेट)'}
                {mode === 'forgot-username' && 'Find Username / Mobile (खाता खोजें)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Only in Login/Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login' 
                  ? 'bg-white text-emerald-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('signIn') || 'Sign In'}
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register' 
                  ? 'bg-white text-emerald-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('register') || 'Register New Account'}
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {/* Status Notifications */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ===================== 1. LOGIN FORM ===================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number or Email (मोबाइल या ईमेल)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or farmer@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Password (पासवर्ड)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setError('');
                      setSuccess('');
                      setRecoveryIdentifier(identifier);
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Forgot Password? (पासवर्ड भूल गए?)
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Username/Mobile prompt */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-username');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Forgot registered mobile or email? (यूज़रनेम भूल गए?)</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{t('signIn') || 'Sign In to Dashboard'}</span>
                )}
              </button>
            </form>
          )}

          {/* ===================== 2. REGISTER FORM ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  I am a (मेरी भूमिका)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('FARMER')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      regRole === 'FARMER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Tractor className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">{t('farmer') || 'Farmer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('BUYER')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      regRole === 'BUYER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">{t('buyer') || 'Buyer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('FPO')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      regRole === 'FPO'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">{t('fpo') || 'FPO'}</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your legal full name"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (मोबाइल नंबर) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-12 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Email (Optional for farmer, recommended for buyer) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (ईमेल पता - Optional)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (पासवर्ड) *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dynamic Location Details (Master Data API) */}
              <div>
                <LocationSelector
                  selectedState={state}
                  selectedDistrict={district}
                  selectedVillage={village}
                  onLocationChange={(loc) => {
                    setState(loc.state);
                    setDistrict(loc.district);
                    setVillage(loc.village);
                  }}
                  showVillage={true}
                  compact={true}
                />
              </div>

              {/* Role Specific Details */}
              {regRole === 'FARMER' ? (
                <div className="grid grid-cols-2 gap-2">
                  <CropSelector
                    value={primaryCrop}
                    onChange={setPrimaryCrop}
                    label="Primary Crop (मुख्य फसल)"
                    showLabel={true}
                    id="auth-primary-crop"
                  />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Land Size (एकड़)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={landAcres}
                      onChange={(e) => setLandAcres(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Name (व्यापार / कंपनी का नाम)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter registered business name"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{t('register') || 'Complete Registration'}</span>
                )}
              </button>
            </form>
          )}

          {/* ===================== 3. FORGOT PASSWORD FLOW ===================== */}
          {mode === 'forgot-password' && (
            <div className="space-y-4">
              {!otpSent ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Password Reset Verification (पासवर्ड सत्यापन)</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Enter your registered 10-digit mobile number or email address. We will generate a secure 6-digit OTP to verify your ownership.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Mobile Number or Email (पंजीकृत मोबाइल या ईमेल)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or user@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Send 6-Digit OTP (ओटीपी भेजें)</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-username'); setError(''); setSuccess(''); }}
                      className="text-xs text-slate-500 hover:text-emerald-700 font-medium hover:underline"
                    >
                      Don't remember your registered number? Click here to locate account.
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Enter OTP and New Password */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* OTP Info Card with Quick Copy & WhatsApp button */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        OTP dispatched for: <strong>{otpPayload?.maskedPhone || recoveryIdentifier}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>

                    {/* Instant WhatsApp Alert & Quick Copy Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                      {otpPayload?.debugOtp && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-700">Generated OTP:</span>
                          <span className="font-mono font-black text-sm bg-white border border-slate-300 px-2.5 py-0.5 rounded-lg text-emerald-800 tracking-wider">
                            {otpPayload.debugOtp}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setRecoveryOtp(otpPayload.debugOtp);
                              copyToClipboard(otpPayload.debugOtp);
                            }}
                            className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-[10px] font-bold flex items-center gap-1"
                            title="Auto-fill OTP"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedOtp ? 'Copied!' : 'Auto Fill'}</span>
                          </button>
                        </div>
                      )}

                      {otpPayload?.whatsappUrl && (
                        <a
                          href={otpPayload.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open in WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 6-Digit OTP Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                      Enter 6-Digit Verification OTP (६ अंकों का ओटीपी)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-mono font-black tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      New Password (नया पासवर्ड)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm New Password (नए पासवर्ड की पुष्टि करें)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Reset Password & Sign In (पासवर्ड रीसेट करें)</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ===================== 4. FORGOT USERNAME / MOBILE FLOW ===================== */}
          {mode === 'forgot-username' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>Account Locator (पंजीकृत खाता खोजें)</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Forgot which mobile number or email you registered with? Locate your account using your legal name and district, or your backup email address.
                </p>
              </div>

              {/* Toggle Search Mode */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setUsernameSearchType('location'); setFoundAccounts([]); setSearchAttempted(false); }}
                  className={`py-1.5 rounded-lg transition-all ${
                    usernameSearchType === 'location'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Name & Location (नाम और स्थान)
                </button>
                <button
                  type="button"
                  onClick={() => { setUsernameSearchType('email'); setFoundAccounts([]); setSearchAttempted(false); }}
                  className={`py-1.5 rounded-lg transition-all ${
                    usernameSearchType === 'email'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Email (ईमेल से खोजें)
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleLocateAccount} className="space-y-3">
                {usernameSearchType === 'email' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (ईमेल पता)
                    </label>
                    <input
                      type="email"
                      required
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="e.g. farmer@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (पूरा नाम) *
                      </label>
                      <input
                        type="text"
                        required
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Enter your registered legal name"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <LocationSelector
                      selectedState={searchState}
                      selectedDistrict={searchDistrict}
                      onLocationChange={(loc) => {
                        setSearchState(loc.state);
                        setSearchDistrict(loc.district);
                      }}
                      showVillage={false}
                      compact={true}
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Locate My Account (खाता खोजें)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Search Results Display */}
              {foundAccounts.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">
                    Matching Accounts Found ({foundAccounts.length}):
                  </span>
                  {foundAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{acc.name}</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-slate-600 space-y-0.5 text-[11px]">
                        <p>
                          <strong>Registered Mobile:</strong>{' '}
                          <span className="font-mono font-bold text-slate-900">{acc.phone || acc.maskedPhone}</span>
                        </p>
                        {acc.district && (
                          <p><strong>Location:</strong> {acc.district}, {acc.state}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier(acc.phone || acc.maskedPhone);
                            setMode('login');
                            setError('');
                            setSuccess(`Identifier pre-filled. Enter your password to sign in.`);
                          }}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all"
                        >
                          Sign In with this Number
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRecoveryIdentifier(acc.phone || acc.maskedPhone);
                            setMode('forgot-password');
                            setError('');
                            setSuccess(`Resetting password for ${acc.name}. Click 'Send OTP'.`);
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-all"
                        >
                          Reset Password
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Register as a Farmer / Buyer
              </button>
            </span>
          ) : mode === 'register' ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign in to your account
              </button>
            </span>
          ) : (
            <span>
              Remembered your credentials?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Back to Sign In (लॉग इन पर वापस जाएं)
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
