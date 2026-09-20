import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  Globe, 
  User,
  LogOut,
  Bell, 
  ChevronDown, 
  Sparkles,
  TrendingUp,
  Store,
  Landmark,
  Truck,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  BarChart3,
  Layers
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useLocationContext } from '../contexts/LocationContext';
import AuthModal from './AuthModal';
import LocationModal from './LocationModal';

export default function Navbar({ onOpenVoice }) {
  const { currentLang, changeLanguage, t, LANGUAGES } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, hasUnread, markAllRead } = useSocket();
  const { selectedState, selectedDistrict } = useLocationContext();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const navigate = useNavigate();
  const location = useLocation();

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getPortalLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'BUYER') return '/buyer';
    if (user.role === 'FPO') return '/fpo';
    return '/dashboard';
  };

  // Dedicated Admin layout handles admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { label: t('checkPrice') || 'Mandi Rates', path: '/dashboard', icon: BarChart3 },
    { label: 'Harvest Decision', path: '/decision', icon: Sparkles, badge: 'AI' },
    { label: t('priceForecast') || 'Price Forecast', path: '/market', icon: TrendingUp },
    { label: t('governmentSchemes') || 'Govt Schemes', path: '/schemes', icon: Landmark },
    { label: t('findBuyer') || 'Buyers', path: '/buyers', icon: Store },
    { label: t('findTransport') || 'Logistics', path: '/logistics', icon: Truck }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        {/* Top Bar for Official Verification & Live Status */}
        <div className="bg-emerald-950 border-b border-emerald-900/80 px-4 py-1.5 text-xs text-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-700/50 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Official Portal
            </span>
            <span className="hidden sm:inline font-medium text-emerald-200 text-[11px]">
              National Farmer Market Linkage & Fair Price Discovery Platform
            </span>
          </div>

          {/* Right side live gateway indicator & quick location changer */}
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white px-2.5 py-0.5 rounded-md border border-emerald-700/60 transition-colors font-medium cursor-pointer"
              title="Click to switch State and District"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{selectedDistrict}, {selectedState}</span>
              <span className="text-[10px] text-emerald-400 underline ml-0.5">Change</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-emerald-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Agmarknet & e-NAM Live</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
          
          {/* Left: Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group py-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-all">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  KisanSetu
                </span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase leading-tight">
                National Farmer Portal
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold text-slate-600">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/90 font-bold shadow-xs'
                      : 'hover:text-emerald-700 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* Quick Location Pill on Tablet/Mobile */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="hidden sm:flex xl:hidden items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[120px] truncate">{selectedDistrict}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen) {
                    markAllRead();
                  }
                }}
                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors cursor-pointer"
                aria-label="Notifications"
                title="Notifications & Updates"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-800">{t('notifications') || 'Smart Alerts'}</h4>
                    <span className="text-[11px] text-emerald-600 font-semibold">{t('liveUpdates') || 'Live Updates'}</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors border border-slate-100">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5 px-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                          <Bell className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          {t('noNotifications') || 'कोई नई सूचना नहीं है (No new alerts)'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          नई योजना, भाव या खरीदार के ऑफर आते ही यहां दिखेंगे।
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector (9 Indian Languages) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Language / भाषा चुनें
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between font-semibold transition-colors ${
                          currentLang === lang.code
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Sign In CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.name?.split(' ')[0]}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.phone || user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getPortalLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 font-semibold"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('myProfile') || 'Dashboard'}</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 font-semibold"
                    >
                      <User className="w-4 h-4" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout') || 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('login') || 'Sign In'}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
            
            {/* Location Bar in Mobile */}
            <div className="bg-emerald-50 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">
                  {selectedDistrict}, {selectedState}
                </span>
              </div>
              <button
                onClick={() => {
                  setLocationModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-emerald-700 font-bold underline"
              >
                Change Region
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-slate-800 flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {!user && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex-1 py-3 text-center text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-xs"
                >
                  Farmer Login
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="flex-1 py-3 text-center text-xs font-bold border border-slate-200 text-slate-700 rounded-xl"
                >
                  New Registration
                </button>
              </div>
            )}
          </div>
        )}

      </header>

      {/* Location Modal */}
      <LocationModal 
        isOpen={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)} 
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
