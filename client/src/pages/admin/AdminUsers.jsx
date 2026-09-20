import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  RefreshCw,
  Eye,
  MessageCircle,
  X
} from 'lucide-react';
import api from '../../services/api';
import LocationSelector from '../../components/LocationSelector';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected User Modal View
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [verifiedAlert, setVerifiedAlert] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, stateFilter, districtFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (stateFilter) params.append('state', stateFilter);
      if (districtFilter) params.append('district', districtFilter);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user, newStatus) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/status`, { status: newStatus });
      if (res.data.success) {
        setActionMsg(`User ${user.name} status updated to ${newStatus}`);
        setTimeout(() => setActionMsg(''), 3500);
        fetchUsers();
        if (selectedUser?._id === user._id) setSelectedUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleVerify = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/status`, { verified: !user.verified });
      if (res.data.success) {
        const isNowVerified = !user.verified;
        setActionMsg(`User ${user.name} verification set to ${isNowVerified ? 'Verified' : 'Unverified'}`);
        setTimeout(() => setActionMsg(''), 4000);

        if (isNowVerified && res.data.notification?.whatsappUrl) {
          setVerifiedAlert({
            user,
            whatsappUrl: res.data.notification.whatsappUrl,
            message: res.data.notification.message
          });
        } else {
          setVerifiedAlert(null);
        }

        fetchUsers();
        if (selectedUser?._id === user._id) setSelectedUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name} (${user.phone})? This action will be recorded in the audit log.`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${user._id}`);
      if (res.data.success) {
        setActionMsg(`User ${user.name} deleted.`);
        setTimeout(() => setActionMsg(''), 3500);
        fetchUsers();
        if (selectedUser?._id === user._id) setSelectedUser(null);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Platform Registry
            </span>
            <span className="text-xs text-slate-400">Total Entities: {users.length}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">User Governance & Verification</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage real registered farmers, commercial buyers, and FPOs across India.</p>
        </div>

        <button
          onClick={fetchUsers}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Toast / Banner */}
      {actionMsg && (
        <div className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in duration-200">
          <span>✓ {actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Direct WhatsApp Verification Notification Card */}
      {verifiedAlert && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 p-4 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">
                Verification Dispatched
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                {verifiedAlert.user.name} officially verified! In-App & Email alerts triggered.
              </h4>
              <p className="text-xs text-slate-600">
                Send the official WhatsApp verification certificate with 1-click:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <a
              href={verifiedAlert.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp Notice (व्हाट्सएप भेजें)</span>
            </a>
            <button
              onClick={() => setVerifiedAlert(null)}
              className="p-1.5 hover:bg-emerald-200/60 rounded-xl text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone (+91), or email..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white"
            >
              <option value="ALL">All Roles</option>
              <option value="FARMER">Farmers</option>
              <option value="BUYER">Buyers</option>
              <option value="FPO">FPOs</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
              <option value="Suspended">Suspended</option>
            </select>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Location Filter */}
        <div className="pt-3 border-t border-slate-100">
          <LocationSelector
            selectedState={stateFilter}
            selectedDistrict={districtFilter}
            onLocationChange={(loc) => {
              setStateFilter(loc.state);
              setDistrictFilter(loc.district);
            }}
            showVillage={false}
            compact={true}
          />
        </div>
      </div>

      {/* Users Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No users found matching your filters.</p>
            <p className="text-[11px]">Try adjusting the state, district, or role filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">User / Entity</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Region</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{u.phone} {u.email ? `• ${u.email}` : ''}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        u.role === 'FARMER' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'BUYER' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'FPO' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-900 text-white'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {u.district ? `${u.district}, ${u.state}` : (u.state || 'Unspecified')}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleVerify(u)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                          title={u.verified ? 'Revoke Verification' : 'Verify User Identity'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u, u.status === 'Active' ? 'Suspended' : 'Active')}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                          title={u.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>

                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedUser.phone} {selectedUser.email ? `• ${selectedUser.email}` : ''}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                <strong className="text-slate-900">{selectedUser.role}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Region</span>
                <strong className="text-slate-900">{selectedUser.district}, {selectedUser.state}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification</span>
                <strong className={selectedUser.verified ? 'text-emerald-700' : 'text-amber-700'}>
                  {selectedUser.verified ? 'Verified Citizen' : 'Pending Verification'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
                <strong className="text-slate-900">{selectedUser.status || 'Active'}</strong>
              </div>
            </div>

            {/* Role specific info */}
            {selectedUser.role === 'FARMER' && selectedUser.farmerDetails && (
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Farmer Profile Attributes</span>
                <p>Crops: <strong>{(selectedUser.farmerDetails.primaryCrops || []).join(', ') || 'None specified'}</strong></p>
                <p>Land Size: <strong>{selectedUser.farmerDetails.landSizeAcres || 0} Acres</strong> ({selectedUser.farmerDetails.landCategory || 'Small'})</p>
                <p>Irrigation: <strong>{selectedUser.farmerDetails.irrigationType || 'Rainfed'}</strong></p>
              </div>
            )}

            {selectedUser.role === 'BUYER' && selectedUser.buyerDetails && (
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-800 block">Buyer Commercial Profile</span>
                <p>Firm: <strong>{selectedUser.buyerDetails.businessName || 'Not Set'}</strong></p>
                <p>GSTIN: <strong>{selectedUser.buyerDetails.gstNumber || 'Not provided'}</strong></p>
                <p>Type: <strong>{selectedUser.buyerDetails.businessType}</strong></p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
