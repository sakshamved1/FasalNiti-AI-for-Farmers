import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  User, 
  Paperclip,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../../services/api';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('Under Review');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

      const res = await api.get(`/admin/tickets?${params.toString()}`);
      if (res.data.success) {
        setTickets(res.data.tickets);
        if (selectedTicket) {
          const updated = res.data.tickets.find(t => t.ticketId === selectedTicket.ticketId);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || (!replyMessage.trim() && replyStatus === selectedTicket.status)) return;

    try {
      const res = await api.put(`/admin/tickets/${selectedTicket._id || selectedTicket.ticketId}/reply`, {
        message: replyMessage,
        status: replyStatus,
        isInternal: isInternalNote
      });

      if (res.data.success) {
        setActionMsg(`Ticket ${selectedTicket.ticketId} updated successfully.`);
        setTimeout(() => setActionMsg(''), 3500);
        setSelectedTicket(res.data.ticket);
        setReplyMessage('');
        setIsInternalNote(false);
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">Open</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">Under Review</span>;
      case 'Waiting for User':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full">Waiting for Citizen</span>;
      case 'Resolved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Resolved</span>;
      case 'Closed':
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">Closed</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  const getPriorityBadge = (p) => {
    if (p === 'Urgent') return <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded">URGENT</span>;
    if (p === 'High') return <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">HIGH</span>;
    return <span className="text-[10px] text-slate-400 font-semibold">{p}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Citizen Grievances & Helpdesk
            </span>
            <span className="text-xs text-slate-400">Total Active: {tickets.length}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Support Ticket Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review citizen inquiries, assign nodal officers, add internal notes, and resolve grievances.</p>
        </div>

        <button
          onClick={fetchTickets}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 animate-in fade-in-50">
          ✓ {actionMsg}
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Waiting for User">Waiting for User</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Profile Update">Profile Update</option>
          <option value="Government Scheme">Government Scheme</option>
          <option value="Market Price">Market Price</option>
          <option value="Buyer/Seller Issue">Buyer/Seller Issue</option>
          <option value="Payment">Payment</option>
          <option value="Transport">Transport</option>
          <option value="Storage">Storage</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Main Grid: Ticket List + Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No support tickets found.</p>
              <p className="text-[11px]">Tickets filed by citizens and buyers will appear here in real time.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.ticketId}
                onClick={() => { setSelectedTicket(t); setReplyStatus(t.status); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedTicket?.ticketId === t.ticketId
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black text-slate-900">
                    {t.ticketId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(t.priority)}
                    {getStatusBadge(t.status)}
                  </div>
                </div>

                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{t.subject}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Citizen: <strong>{t.name}</strong> ({t.phone})</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>{t.category}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed View & Reply Panel */}
        <div className="lg:col-span-2">
          {!selectedTicket ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-xs text-slate-700">Select a ticket to review conversation</p>
              <p className="text-[11px] text-slate-400">You can respond publicly to the citizen or add internal administrative notes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedTicket.ticketId}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="font-black text-sm text-slate-900">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Filed by <strong>{selectedTicket.name}</strong> • Phone: <span className="font-mono">{selectedTicket.phone}</span> {selectedTicket.email ? `• ${selectedTicket.email}` : ''}
                  </p>
                </div>

                <div className="text-right text-[10px] text-slate-400">
                  <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto">
                {/* Original Inquiry / Grievance Message */}
                {selectedTicket.message && (
                  <div className="p-4 rounded-2xl text-xs space-y-1.5 bg-slate-100/90 border border-slate-200 mr-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span className="flex items-center gap-1 text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {selectedTicket.name} {selectedTicket.department ? `(${selectedTicket.department})` : ''}
                      </span>
                      <span className="text-slate-400 font-normal">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.message}
                    </p>
                    {selectedTicket.district && (
                      <div className="pt-1 text-[10px] text-slate-500 font-semibold">
                        📍 Region: {selectedTicket.district}{selectedTicket.state ? `, ${selectedTicket.state}` : ''}
                      </div>
                    )}
                  </div>
                )}

                {selectedTicket.replies?.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      r.isInternal
                        ? 'bg-amber-50 border border-amber-200 text-amber-950 ml-6'
                        : r.senderRole === 'ADMIN'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 ml-4'
                        : 'bg-slate-100 text-slate-900 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={r.isInternal ? 'text-amber-800 flex items-center gap-1' : r.senderRole === 'ADMIN' ? 'text-emerald-800' : 'text-slate-600'}>
                        {r.isInternal && <Lock className="w-3 h-3" />}
                        {r.isInternal ? '🔒 Internal Admin Note' : r.senderRole === 'ADMIN' ? '🛡️ Administration Reply' : r.senderName}
                      </span>
                      <span className="text-slate-400 font-normal">
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-medium whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
              </div>

              {/* Admin Action & Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Update Status:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Waiting for User">Waiting for User</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-xl">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Make as Internal Note (Hidden from citizen)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isInternalNote ? 'Write internal administrative note...' : 'Type response to citizen...'}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Update Ticket</span>
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
