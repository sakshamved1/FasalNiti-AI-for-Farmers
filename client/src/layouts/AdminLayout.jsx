import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  Landmark, 
  Ticket, 
  ScrollText, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  ExternalLink,
  Store,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // If user is not admin, show access denied card
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Administrator Access Restricted</h1>
          <p className="text-xs text-slate-600">
            This module requires verified platform administrative credentials. Your current role ({user ? user.role : 'Unauthenticated'}) does not have governance privileges.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              Return to Citizen Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Government Schemes', path: '/admin/schemes', icon: Landmark },
    { label: 'Support & Helpdesk', path: '/admin/tickets', icon: Ticket },
    { label: 'System Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900 font-sans">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
            FN
          </div>
          <div>
            <span className="font-black text-sm block leading-none">FasalNiti Admin</span>
            <span className="text-[10px] text-emerald-400 font-semibold">National Control Panel</span>
          </div>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop & Mobile Responsive Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0
        ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-800/80 hidden lg:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-600/30">
              FN
            </div>
            <div>
              <span className="font-black text-base block text-white">FasalNiti AI</span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Admin Control Core
              </span>
            </div>
          </div>

          {/* Admin User Badge */}
          <div className="p-4 mx-3 my-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30 shrink-0">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <span className="font-black text-xs text-white block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{user.email || user.phone}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
              Verified Administrator
            </span>
            <span className="text-xs text-slate-500 font-medium">
              National Agricultural Market Intelligence & Welfare Gateway
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
