import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  TrendingUp, 
  Coins, 
  Store, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CropSelector from '../components/CropSelector';

export default function FPODashboard() {
  const { user } = useAuth();

  const [memberFarmers, setMemberFarmers] = useState([]);

  const [toastMessage, setToastMessage] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newFarmer, setNewFarmer] = useState({
    name: '',
    village: 'Sanwer',
    crop: 'Soybean',
    qtyTonnes: '1.0',
    grade: 'Grade A'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!newFarmer.name.trim()) return;
    const added = {
      id: Date.now(),
      name: newFarmer.name.trim(),
      village: newFarmer.village,
      crop: newFarmer.crop,
      qtyTonnes: Number(newFarmer.qtyTonnes) || 1.0,
      grade: newFarmer.grade
    };
    setMemberFarmers(prev => [added, ...prev]);
    setShowEnrollModal(false);
    setNewFarmer({ name: '', village: 'Sanwer', crop: 'Soybean', qtyTonnes: '1.0', grade: 'Grade A' });
    showToast(`Farmer ${added.name} successfully enrolled with ${added.qtyTonnes} Tonnes ${added.crop}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-600 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-950/50 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Registered FPO • {user?.state ? `${user.district || ''}, ${user.state}` : 'National Collective'}
              </span>
              <span className="text-xs text-emerald-200">
                {memberFarmers.length} Member Farmers • {memberFarmers.reduce((a, b) => a + (b.qtyTonnes || 0), 0).toFixed(1)} Tonnes Pooled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              👥 {user?.fpoDetails?.fpoName || user?.name || 'Producer Organization Collective'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
              Collective Crop Aggregation, Institutional Contract Negotiation & Bulk Storage Management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEnrollModal(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll Member Farmer</span>
            </button>
          </div>
        </div>
      </div>


      {/* Aggregation Highlights & AI Collective Bargaining Gain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pooled Harvest</span>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {memberFarmers.reduce((a, b) => a + (b.qtyTonnes || 0), 0).toFixed(1)} <span className="text-sm font-normal text-slate-500">Tonnes</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Lots Aggregated</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Farmers</span>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {memberFarmers.length} <span className="text-sm font-normal text-slate-500">Members</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Producer Network</span>
        </div>

        <div className="bg-emerald-50 p-5 rounded-3xl border-2 border-emerald-400/80 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Bulk Premium Gain</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">+6.3%</p>
          <span className="text-[11px] text-emerald-800 font-bold mt-1 block">₹280/qtl Collective Advantage</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bulk Order Value</span>
          <p className="text-3xl font-black text-slate-900 mt-1">
            ₹{Math.round(memberFarmers.reduce((a, b) => a + (b.qtyTonnes || 0), 0) * 10 * 4780).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Direct Mill Contract</span>
        </div>

      </div>

      {/* AI Aggregation Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              AI FPO Bargaining Engine
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              "Bulk Sale to Solvent Extraction Mill via e-NAM recommended"
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
              By aggregating 82 tonnes of soybean from 145 member farmers, the FPO qualifies for corporate lot procurement directly by Adani Wilmar / Kriti Nutrients at ₹4,780/quintal (vs local individual mandi rate of ₹4,500). Net collective bonus: <strong>₹2,29,600</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('Corporate bulk lot auction (82.4 Tonnes) published on e-NAM! Mill buyers notified.')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-3 rounded-xl shrink-0 shadow-sm transition-all"
        >
          Publish Bulk Institutional Tender
        </button>
      </div>

      {/* Pooled Farmers Table */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900">
              Active Member Farmer Harvest Contributions
            </h3>
            <p className="text-xs text-slate-500">Tracking quality and weighment per member</p>
          </div>
          <span className="text-xs font-bold text-emerald-700">All Lots Quality Checked</span>
        </div>

        {memberFarmers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Farmer Name</th>
                  <th className="py-2.5 px-3">Village</th>
                  <th className="py-2.5 px-3">Harvest Crop</th>
                  <th className="py-2.5 px-3">Quantity Pooled</th>
                  <th className="py-2.5 px-3">Quality Grade</th>
                  <th className="py-2.5 px-3">Estimated Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {memberFarmers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-900">{f.name}</td>
                    <td className="py-3 px-3">{f.village}</td>
                    <td className="py-3 px-3">{f.crop}</td>
                    <td className="py-3 px-3 font-semibold">{f.qtyTonnes * 1000} kg ({f.qtyTonnes} T)</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {f.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-700">
                      ₹{Math.round(f.qtyTonnes * 10 * 4780).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <div className="text-3xl mb-2">👥</div>
            <h4 className="text-sm font-bold text-slate-700">No member farmers enrolled yet.</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Enroll your first producer member to begin collective crop pooling, bulk market linkage, and institutional bidding.
            </p>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll First Member Farmer</span>
            </button>
          </div>
        )}
      </div>

      {/* Enroll Farmer Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">Enroll Member Farmer to FPO</h3>
                <p className="text-xs text-emerald-200">Aggregate harvest volume for bulk corporate auction</p>
              </div>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="text-white/80 hover:text-white font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radheshyam Yadav"
                  value={newFarmer.name}
                  onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Village / Tehsil</label>
                  <input
                    type="text"
                    value={newFarmer.village}
                    onChange={(e) => setNewFarmer({ ...newFarmer, village: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <CropSelector
                    value={newFarmer.crop}
                    onChange={(crop) => setNewFarmer({ ...newFarmer, crop })}
                    label="Crop"
                    showLabel={true}
                    id="fpo-farmer-crop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity (Tonnes)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newFarmer.qtyTonnes}
                    onChange={(e) => setNewFarmer({ ...newFarmer, qtyTonnes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quality Grade</label>
                  <select
                    value={newFarmer.grade}
                    onChange={(e) => setNewFarmer({ ...newFarmer, grade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-sm text-sm transition-all"
                >
                  Enroll Farmer & Add to Aggregate Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

