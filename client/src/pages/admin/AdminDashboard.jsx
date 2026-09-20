import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Store, 
  Handshake, 
  Landmark, 
  Ticket, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Sprout
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Governance Dashboard
          </span>
          <span className="text-xs text-slate-400">Live Telemetry</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">National Platform Intelligence Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time metrics aggregated strictly from registered platform entities and active deals.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Farmers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.farmersCount ?? 0}</p>
          <span className="text-[11px] text-emerald-700 font-semibold block">Total Registered Producers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Buyers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.buyersCount ?? 0}</p>
          <span className="text-[11px] text-purple-700 font-semibold block">Audited Commercial Buyers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Harvest Lots</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.activeListingsCount ?? 0}</p>
          <span className="text-[11px] text-amber-700 font-semibold block">Live Farmgate Listings</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Open Support Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.tickets?.open ?? 0}</p>
          <span className="text-[11px] text-blue-700 font-semibold block">Pending Citizen Response</span>
        </div>

      </div>

      {/* Support & Action Alert Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
              ADMIN ALERT DESK
            </span>
            <span className="text-xs text-slate-400">Support SLA Tracking</span>
          </div>
          <h3 className="text-lg font-black">
            {stats?.tickets?.open || 0} Open Tickets • {stats?.tickets?.urgent || 0} Flagged as Urgent
          </h3>
          <p className="text-xs text-slate-300">
            Prompt resolution of farmer weighment, payment, or scheme issues maintains top citizen trust.
          </p>
        </div>

        <Link
          to="/admin/tickets"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Open Support Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900">User Governance</h3>
          <p className="text-xs text-slate-500">
            Search and filter farmers, buyers, and FPOs across 36 States. Verify identities, audit KYC, or suspend fraudulent accounts.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900">Government Schemes</h3>
          <p className="text-xs text-slate-500">
            Maintain verified Central & State agricultural schemes. Configure state, district, and crop eligibility rules for dynamic matching.
          </p>
          <Link
            to="/admin/schemes"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline pt-1"
          >
            <span>Manage Schemes</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
            <Handshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900">Marketplace & Deals</h3>
          <p className="text-xs text-slate-500">
            Monitor real farmgate crop listings, counter-offers, and deal escrow confirmations made by authentic registered users.
          </p>
          <Link
            to="/buyers"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline pt-1"
          >
            <span>View Marketplace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

    </div>
  );
}
