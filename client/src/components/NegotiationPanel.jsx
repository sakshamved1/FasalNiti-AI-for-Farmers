import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  Send, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  Coins, 
  AlertCircle,
  Truck,
  Building2,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

export default function NegotiationPanel({ onDealClosed }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [offers, setOffers] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);
  const [counterInput, setCounterInput] = useState('4700');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOffers();

    if (socket) {
      const handleOfferReceived = (data) => {
        if (data?.offer) {
          setOffers(prev => {
            const exists = prev.some(o => o._id === data.offer._id);
            if (exists) return prev.map(o => o._id === data.offer._id ? data.offer : o);
            return [data.offer, ...prev];
          });
          setActiveOffer(prev => prev || data.offer);
          setSuccessMessage(`New offer of ₹${data.offer.offeredPricePerQuintal}/qtl received from ${data.offer.buyerBusiness || data.offer.buyerName}!`);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      };

      const handleOfferUpdated = (data) => {
        if (data?.offer) {
          setOffers(prev => prev.map(o => o._id === data.offer._id ? data.offer : o));
          setActiveOffer(prev => (prev && prev._id === data.offer._id) ? data.offer : prev);
        }
      };

      const handleDealConfirmed = (data) => {
        if (data?.offer) {
          setOffers(prev => prev.map(o => o._id === data.offer._id ? data.offer : o));
          setActiveOffer(prev => (prev && prev._id === data.offer._id) ? data.offer : prev);
          setSuccessMessage(`Deal locked at ₹${data.offer.finalAgreedPrice}/qtl! Order ${data.order?.orderNumber || ''} created.`);
        }
      };

      socket.on('offer_received', handleOfferReceived);
      socket.on('offer_updated', handleOfferUpdated);
      socket.on('deal_confirmed', handleDealConfirmed);

      return () => {
        socket.off('offer_received', handleOfferReceived);
        socket.off('offer_updated', handleOfferUpdated);
        socket.off('deal_confirmed', handleDealConfirmed);
      };
    }
  }, [socket]);

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers');
      if (res.data.success && Array.isArray(res.data.offers)) {
        setOffers(res.data.offers);
        if (res.data.offers.length > 0) {
          setActiveOffer(prev => {
            if (prev && res.data.offers.some(o => o._id === prev._id)) {
              return res.data.offers.find(o => o._id === prev._id);
            }
            return res.data.offers[0];
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  const handleCounter = async () => {
    if (!activeOffer || !counterInput) return;
    setLoading(true);
    try {
      const actor = user?.role === 'BUYER' ? 'BUYER' : 'FARMER';
      const res = await api.post(`/offers/${activeOffer._id}/counter`, {
        counterPrice: Number(counterInput),
        actor
      });
      if (res.data.success) {
        setActiveOffer(res.data.offer);
        setOffers(prev => prev.map(o => o._id === res.data.offer._id ? res.data.offer : o));
      }
    } catch (err) {
      console.error('Failed to send counter offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!activeOffer) return;
    setLoading(true);
    try {
      const res = await api.post(`/offers/${activeOffer._id}/accept`);
      if (res.data.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setActiveOffer(res.data.offer);
        setOffers(prev => prev.map(o => o._id === res.data.offer._id ? res.data.offer : o));
        setSuccessMessage(`Deal successfully finalized at ₹${res.data.offer.finalAgreedPrice}/qtl!`);
        if (onDealClosed) onDealClosed(res.data.order);
      }
    } catch (err) {
      console.error('Failed to accept offer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Real-Time Negotiations (Socket.IO)
              </span>
              <span className="text-xs font-bold text-emerald-600">
                Verified Escrow Protected
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Live Offer & Counter-Offer Hub
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            {offers.length} Active Offers
          </span>
        </div>
      </div>

      {/* Multiple Offers Switcher */}
      {offers.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Select Offer:</span>
          {offers.map((off, idx) => (
            <button
              key={off._id || idx}
              onClick={() => setActiveOffer(off)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeOffer?._id === off._id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {off.buyerBusiness || off.buyerName} (₹{off.offeredPricePerQuintal}/qtl)
            </button>
          ))}
        </div>
      )}

      {activeOffer ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Buyer Credibility Profile */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Buyer Business</span>
                <h4 className="text-base font-black text-slate-900">{activeOffer.buyerBusiness}</h4>
                <p className="text-xs text-slate-500 font-medium">Rep: {activeOffer.buyerName}</p>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Buyer Trust Score:</span>
                <span className="font-extrabold text-emerald-700">{activeOffer.buyerTrustScore}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${activeOffer.buyerTrustScore}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>148 Deals Closed</span>
                <span>0.7% Dispute Rate</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Crop Offered:</span>
                <strong className="text-slate-800">{activeOffer.cropName} ({activeOffer.quantityKg} kg)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Terms:</span>
                <strong className="text-slate-800">Direct Bank DBT / Escrow</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Pickup:</span>
                <strong className="text-emerald-700">Buyer Arranges (Farmgate)</strong>
              </div>
            </div>
          </div>

          {/* Live Negotiation Timeline */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
            
            {/* Timeline Stream */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {activeOffer.timeline.map((step, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl text-xs flex items-start justify-between border ${
                    step.actor === 'SYSTEM'
                      ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-950'
                      : (step.actor === 'BUYER' 
                          ? 'bg-amber-50/70 border-amber-200' 
                          : 'bg-emerald-50/70 border-emerald-200')
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold shrink-0">
                      {step.actor === 'BUYER' ? '🏢 Buyer:' : (step.actor === 'FARMER' ? '👨‍🌾 Farmer:' : '⚡ System:')}
                    </span>
                    <span>{step.action}</span>
                  </div>
                  {step.pricePerQuintal && (
                    <span className="font-black text-slate-900 shrink-0 ml-2">
                      ₹{step.pricePerQuintal}/qtl
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Negotiation Action Form */}
            {activeOffer.status !== 'Accepted' ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Counter Offer Price (₹ / quintal):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="25"
                        value={counterInput}
                        onChange={(e) => setCounterInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 pr-12 focus:ring-2 focus:ring-emerald-500"
                        placeholder="4700"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                        / qtl
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={handleCounter}
                      disabled={loading}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Counter Offer</span>
                    </button>

                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Deal</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  💡 Tip: The buyer offered ₹{activeOffer.offeredPricePerQuintal}. Countering with ₹4,700 yields ₹23,500 total payout.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center">
                <h4 className="text-base font-black text-emerald-950 flex items-center justify-center gap-2">
                  <span>🎉 Deal Confirmed at ₹{activeOffer.finalAgreedPrice}/quintal!</span>
                </h4>
                <p className="text-xs text-emerald-800 font-medium mt-1">
                  Agreement locked on platform. Escrow funded by {activeOffer.buyerBusiness || 'Verified Buyer'}. Total amount: ₹{(activeOffer.finalAgreedPrice * (activeOffer.quantityKg / 100)).toLocaleString()}.
                </p>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center">
                {successMessage}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <div className="text-3xl mb-2">🤝</div>
          <h4 className="text-sm font-bold text-slate-700">You haven't received any offers yet.</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once a verified buyer submits a price quotation or counter-offer for your crops, it will appear here for live negotiation.
          </p>
        </div>
      )}

    </div>
  );
}
