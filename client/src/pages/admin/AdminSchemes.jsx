import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  X,
  Search,
  Filter
} from 'lucide-react';
import api from '../../services/api';

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  // Form fields
  const [schemeName, setSchemeName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('Income Support');
  const [summary, setSummary] = useState('');
  const [states, setStates] = useState('All India / Central');
  const [applicableCrops, setApplicableCrops] = useState('All Crops');
  const [farmerCategories, setFarmerCategories] = useState('All Categories');
  const [benefitAmount, setBenefitAmount] = useState('');
  const [benefitDesc, setBenefitDesc] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [status, setStatus] = useState('Active');

  const categories = [
    'Income Support', 
    'Crop Insurance', 
    'Agricultural Credit', 
    'Irrigation Support', 
    'Soil Health', 
    'Farm Mechanization', 
    'Solar Agriculture', 
    'Warehouse & Infrastructure', 
    'Procurement & Price Support',
    'Cotton & Fiber Development'
  ];

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/schemes');
      if (res.data.success) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingScheme(null);
    setSchemeName('');
    setShortCode('');
    setDepartment('Ministry of Agriculture & Farmers Welfare');
    setCategory('Income Support');
    setSummary('');
    setStates('All India / Central');
    setApplicableCrops('All Crops');
    setFarmerCategories('All Categories');
    setBenefitAmount('');
    setBenefitDesc('');
    setOfficialUrl('https://agricoop.nic.in');
    setStatus('Active');
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingScheme(s);
    setSchemeName(s.schemeName || '');
    setShortCode(s.shortCode || '');
    setDepartment(s.department || '');
    setCategory(s.category || 'Income Support');
    setSummary(s.summary || '');
    setStates((s.states || (s.state ? [s.state] : [])).join(', '));
    setApplicableCrops((s.applicableCrops || []).join(', '));
    setFarmerCategories((s.farmerCategories || []).join(', '));
    setBenefitAmount(s.benefits?.financialAmount || '');
    setBenefitDesc(s.benefits?.benefitDescription || '');
    setOfficialUrl(s.officialUrl || '');
    setStatus(s.status || 'Active');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        schemeName,
        shortCode,
        department,
        category,
        summary,
        states: states.split(',').map(s => s.trim()).filter(Boolean),
        applicableCrops: applicableCrops.split(',').map(c => c.trim()).filter(Boolean),
        farmerCategories: farmerCategories.split(',').map(c => c.trim()).filter(Boolean),
        benefits: {
          financialAmount: benefitAmount,
          benefitDescription: benefitDesc
        },
        officialUrl,
        status
      };

      if (editingScheme) {
        const res = await api.put(`/admin/schemes/${editingScheme._id || editingScheme.shortCode}`, payload);
        if (res.data.success) {
          setActionMsg(`Scheme ${schemeName} updated successfully.`);
        }
      } else {
        const res = await api.post('/admin/schemes', payload);
        if (res.data.success) {
          setActionMsg(`Scheme ${schemeName} created successfully.`);
        }
      }

      setTimeout(() => setActionMsg(''), 3500);
      setShowModal(false);
      fetchSchemes();
    } catch (err) {
      console.error('Save scheme error:', err);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Are you sure you want to delete scheme '${s.schemeName}'?`)) return;
    try {
      const res = await api.delete(`/admin/schemes/${s._id || s.shortCode}`);
      if (res.data.success) {
        setActionMsg(`Scheme deleted.`);
        setTimeout(() => setActionMsg(''), 3500);
        fetchSchemes();
      }
    } catch (err) {
      console.error('Delete scheme error:', err);
    }
  };

  const filtered = schemes.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.schemeName.toLowerCase().includes(q) || s.shortCode.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Welfare Database
            </span>
            <span className="text-xs text-slate-400">Total Schemes: {schemes.length}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Government Scheme Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Author, configure eligibility rules, and verify central & state welfare programs.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Scheme</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 animate-in fade-in-50">
          ✓ {actionMsg}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search scheme by name, short code, or category..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s._id || s.shortCode} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                  {s.shortCode}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                  s.status === 'Expired' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {s.status || 'Active'}
                </span>
              </div>

              <h3 className="font-black text-sm text-slate-900 mt-2 line-clamp-2">
                {s.schemeName}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{s.department}</p>
              
              <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                {s.summary}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div>State: <strong className="text-slate-700">{(s.states || [s.state]).join(', ')}</strong></div>
                <div>Crops: <strong className="text-slate-700">{(s.applicableCrops || []).join(', ') || 'All Crops'}</strong></div>
                <div>Benefits: <strong className="text-emerald-700">{s.benefits?.financialAmount || 'Subsidy'}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={s.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  title="Edit Scheme"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="Delete Scheme"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  {editingScheme ? 'Edit Government Scheme' : 'Add New Government Scheme'}
                </h3>
                <span className="text-xs text-slate-400">Central & State Agricultural Welfare Record</span>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pradhan Mantri Fasal Bima Yojana"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Code / Acronym *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PMFBY"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-mono uppercase"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Ministry *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Agriculture"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 outline-none focus:bg-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Summary / Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Comprehensive description of scheme benefits and goals..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applicable States (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="All India / Central or Gujarat, MP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white"
                    value={states}
                    onChange={(e) => setStates(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applicable Crops</label>
                  <input
                    type="text"
                    placeholder="All Crops or Cotton, Soybean"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white"
                    value={applicableCrops}
                    onChange={(e) => setApplicableCrops(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 outline-none focus:bg-white"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active (Verified)</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Financial Benefit Details</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹6,000 per year"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white"
                    value={benefitAmount}
                    onChange={(e) => setBenefitAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Portal URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow-sm"
                >
                  {editingScheme ? 'Save Changes' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
