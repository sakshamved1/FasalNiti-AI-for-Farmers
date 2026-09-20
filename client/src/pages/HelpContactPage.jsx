import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  Ticket, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  Paperclip, 
  ChevronRight,
  User,
  PlusCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export default function HelpContactPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('NEW'); // 'NEW' or 'MY_TICKETS'
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState('Technical Issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState('');

  const [loading, setLoading] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Technical Issue',
    'Profile Update',
    'Government Scheme',
    'Market Price',
    'Buyer/Seller Issue',
    'Payment',
    'Transport',
    'Storage',
    'Other'
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    if (!user) return;
    try {
      const res = await api.get('/support/my-tickets');
      if (res.data.success) {
        setMyTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessTicketId('');

    try {
      const res = await api.post('/support/tickets', {
        name,
        email,
        phone,
        category,
        subject,
        message,
        attachment
      });

      if (res.data.success) {
        setSuccessTicketId(res.data.ticket.ticketId);
        setSubject('');
        setMessage('');
        setAttachment('');
        if (user) fetchMyTickets();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit support ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const res = await api.post(`/support/tickets/${selectedTicket._id || selectedTicket.ticketId}/reply`, {
        message: replyMessage
      });

      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setReplyMessage('');
        fetchMyTickets();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">Open</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">Under Review</span>;
      case 'Waiting for User':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full">Waiting for You</span>;
      case 'Resolved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Resolved</span>;
      case 'Closed':
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">Closed</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Citizen Support Desk
            </span>
            <span className="text-xs text-slate-400">Response SLA: &lt; 24 Hours</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            🤝 {t('helpContactTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
            {t('helpContactSubtitle')}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-1.5 shrink-0">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <PhoneCall className="w-4 h-4" />
            <span>Kisan Call Centre: 1800-180-1551</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <Mail className="w-3.5 h-3.5" />
            <span>support@kisansetu.gov.in</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => { setActiveTab('NEW'); setSelectedTicket(null); }}
          className={`flex items-center gap-1.5 pb-3 font-black text-xs sm:text-sm transition-all border-b-2 ${
            activeTab === 'NEW'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('submitNewTicket')}</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_TICKETS')}
          className={`flex items-center gap-1.5 pb-3 font-black text-xs sm:text-sm transition-all border-b-2 ${
            activeTab === 'MY_TICKETS'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>{t('myTickets')} ({myTickets.length})</span>
        </button>
      </div>

      {/* Tab 1: New Ticket Form */}
      {activeTab === 'NEW' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {successTicketId ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-emerald-950">
                Support Ticket Generated Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Your Ticket ID is <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{successTicketId}</strong>.
                Our administration desk will review your inquiry shortly.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { setActiveTab('MY_TICKETS'); setSuccessTicketId(''); }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-xs"
                >
                  View My Tickets
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('ticketCategory')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('ticketSubject')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of the problem"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('ticketMessage')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your problem, question, or request in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('attachmentUrl')}</span>
                </label>
                <input
                  type="url"
                  placeholder="Paste URL to image, document or screenshot if applicable"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  value={attachment}
                  onChange={(e) => setAttachment(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? t('loading') : t('submitTicket')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: My Support Tickets */}
      {activeTab === 'MY_TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Your Support Tickets ({myTickets.length})
            </h3>

            {!user ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <p>Log in to view your submitted support tickets and converse with platform administration.</p>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No support tickets filed yet.</p>
                <p className="text-[11px]">Any issues or inquiries you submit will appear here with live resolution status.</p>
              </div>
            ) : (
              myTickets.map((tkt) => (
                <div
                  key={tkt.ticketId}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedTicket?.ticketId === tkt.ticketId
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] font-black text-slate-900">
                      {tkt.ticketId}
                    </span>
                    {getStatusBadge(tkt.status)}
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                    {tkt.subject}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>{tkt.category}</span>
                    <span>{new Date(tkt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Detail & Communication Timeline */}
          <div className="lg:col-span-2">
            {!selectedTicket ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-xs text-slate-700">Select a support ticket to view conversation</p>
                <p className="text-[11px] text-slate-400">You can communicate with the administration nodal officer directly on each ticket.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedTicket.ticketId}
                      </span>
                      {getStatusBadge(selectedTicket.status)}
                      <span className="text-[11px] text-slate-400">• {selectedTicket.category}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 mt-1">
                      {selectedTicket.subject}
                    </h3>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <span>Opened: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto">
                  {selectedTicket.replies?.map((r, i) => (
                    <div 
                      key={i}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        r.senderRole === 'ADMIN'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 ml-4'
                          : 'bg-slate-100 text-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className={r.senderRole === 'ADMIN' ? 'text-emerald-800' : 'text-slate-600'}>
                          {r.senderRole === 'ADMIN' ? '🛡️ Platform Administration' : r.senderName}
                        </span>
                        <span className="text-slate-400 font-normal">
                          {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-medium whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your response to the administrator..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
