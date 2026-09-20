import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  TrendingUp, 
  Sparkles, 
  Store, 
  Handshake, 
  Truck, 
  PackageCheck, 
  Wallet, 
  Star,
  CheckCircle2,
  Clock,
  Send,
  MapPin,
  Share2,
  AlertCircle,
  RotateCw,
  MessageCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

export default function HarvestJourney({ currentStage, orderData }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(orderData || null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [checkpointNote, setCheckpointNote] = useState('');
  const [checkpointLocation, setCheckpointLocation] = useState('');
  const [statusFeedback, setStatusFeedback] = useState('');

  const stages = [
    { key: 'HARVEST_READY', label: 'Harvest Ready', labelHi: 'फसल तैयार', icon: Sprout, description: 'Crop dried & bagged' },
    { key: 'PRICE_CHECKED', label: 'Price Checked', labelHi: 'मंडी भाव जांचा', icon: TrendingUp, description: 'Live mandi rates' },
    { key: 'AI_RECOMMENDED', label: 'AI Advisory', labelHi: 'एआई सलाह', icon: Sparkles, description: 'Decision Engine verdict' },
    { key: 'BUYER_MATCHED', label: 'Buyer Matched', labelHi: 'खरीदार मिला', icon: Store, description: 'Verified buyer discovery' },
    { key: 'DEAL_CONFIRMED', label: 'Deal Confirmed', labelHi: 'सौदा पक्का', icon: Handshake, description: 'Price agreed & locked' },
    { key: 'TRANSPORT_DISPATCHED', label: 'Transport', labelHi: 'वाहन रवाना', icon: Truck, description: 'Vehicle en-route to hub' },
    { key: 'DELIVERED_WEIGHED', label: 'Delivery & Weight', labelHi: 'तौल और डिलीवरी', icon: PackageCheck, description: 'Electronic weighbridge' },
    { key: 'PAYMENT_RELEASED', label: 'Payment Released', labelHi: 'भुगतान जारी', icon: Wallet, description: 'Same-day direct bank DBT' },
    { key: 'COMPLETED', label: 'Trust Rating', labelHi: 'सौदा पूर्ण', icon: Star, description: 'Mutual feedback score' }
  ];

  useEffect(() => {
    if (orderData) {
      setSelectedOrder(orderData);
    } else {
      fetchLiveOrders();
    }
  }, [orderData]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (data) => {
      if (data.order) {
        setOrders(prev => {
          const exists = prev.some(o => o._id === data.order._id);
          if (exists) {
            return prev.map(o => o._id === data.order._id ? data.order : o);
          }
          return [data.order, ...prev];
        });

        if (!selectedOrder || selectedOrder._id === data.order._id) {
          setSelectedOrder(data.order);
        }

        setStatusFeedback(`Live tracking updated to ${data.friendlyStage || data.stage} by ${data.updatedBy?.name || 'User'}`);
        setTimeout(() => setStatusFeedback(''), 4000);
      }
    };

    socket.on('order_status_updated', handleOrderUpdate);
    socket.on('deal_confirmed', (data) => {
      if (data.order) {
        setOrders(prev => [data.order, ...prev]);
        setSelectedOrder(data.order);
      }
    });

    return () => {
      socket.off('order_status_updated', handleOrderUpdate);
    };
  }, [socket, selectedOrder]);

  const fetchLiveOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/orders');
      if (res.data.success && res.data.orders.length > 0) {
        setOrders(res.data.orders);
        if (!selectedOrder) {
          setSelectedOrder(res.data.orders[0]);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live orders:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const activeStageKey = selectedOrder?.stage || currentStage || 'DEAL_CONFIRMED';
  const currentIndex = stages.findIndex(s => s.key === activeStageKey);
  const activeIdx = currentIndex === -1 ? 4 : currentIndex;

  // Next logical stage transition mapping
  const nextStageMap = {
    DEAL_CONFIRMED: {
      next: 'TRANSPORT_DISPATCHED',
      buttonText: '🚛 Mark Transport Dispatched (वाहन रवाना करें)',
      defaultNote: 'Vehicle loaded from farmgate and en route to mandi warehouse',
      defaultLoc: selectedOrder?.currentLocation || 'Farmgate Location'
    },
    TRANSPORT_DISPATCHED: {
      next: 'DELIVERED_WEIGHED',
      buttonText: '⚖️ Confirm Delivery & Weighment (तौल और डिलीवरी की पुष्टि)',
      defaultNote: 'Lot arrived at weighbridge. Weight certified by electronic slip',
      defaultLoc: 'Central APMC Mandi Weighbridge'
    },
    DELIVERED_WEIGHED: {
      next: 'PAYMENT_RELEASED',
      buttonText: '💰 Release Escrow Payment (किसान को भुगतान जारी करें)',
      defaultNote: 'Quality & net weight confirmed. Escrow payment released to farmer account',
      defaultLoc: 'e-NAM Settlement Terminal'
    },
    PAYMENT_RELEASED: {
      next: 'COMPLETED',
      buttonText: '⭐ Mark Order Completed & Rate (सौदा पूर्ण करें)',
      defaultNote: 'Full transaction settled. 5-Star mutual feedback score assigned',
      defaultLoc: 'Transaction Finalized'
    }
  };

  const nextAction = nextStageMap[activeStageKey];

  const handleAdvanceStage = async () => {
    if (!selectedOrder || !nextAction) return;

    setUpdatingStage(true);
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/stage`, {
        stage: nextAction.next,
        note: checkpointNote.trim() || nextAction.defaultNote,
        location: checkpointLocation.trim() || nextAction.defaultLoc
      });

      if (res.data.success) {
        setSelectedOrder(res.data.order);
        setOrders(prev => prev.map(o => o._id === res.data.order._id ? res.data.order : o));
        setCheckpointNote('');
        setCheckpointLocation('');
        setStatusFeedback(`Milestone successfully updated to: ${nextAction.next}`);
        setTimeout(() => setStatusFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update order stage:', err);
      setStatusFeedback('Failed to update stage. Please check connection.');
    } finally {
      setUpdatingStage(false);
    }
  };

  // WhatsApp Share URL for live tracking link
  const clientUrl = window.location.origin;
  const whatsappShareText = selectedOrder ? `🌾 *FasalNiti AI Live Harvest Tracking*
Order *#${selectedOrder.orderNumber}* (${selectedOrder.quantityKg} kg ${selectedOrder.cropName})
📍 Status: *${stages[activeIdx]?.label} (${stages[activeIdx]?.labelHi})*
📍 Current Location: ${selectedOrder.currentLocation || 'Mandi Corridor'}
💰 Agreed Rate: ₹${selectedOrder.pricePerQuintal}/quintal (Total: ₹${(selectedOrder.totalGrossAmount || 0).toLocaleString()})
Track live: ${clientUrl}/farmer` : '';

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareText)}`;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Live Digital Traceability
            </span>
            {selectedOrder?.orderNumber && (
              <span className="text-xs font-bold text-slate-500 font-mono">
                Order #{selectedOrder.orderNumber}
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            🌾 Live Harvest Value Chain & Logistics Tracking
          </h3>
        </div>

        {/* Order Selector if multiple orders exist */}
        <div className="flex items-center gap-2">
          {orders.length > 1 && (
            <select
              value={selectedOrder?._id || ''}
              onChange={(e) => {
                const found = orders.find(o => o._id === e.target.value);
                if (found) setSelectedOrder(found);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {orders.map(o => (
                <option key={o._id} value={o._id}>
                  #{o.orderNumber} • {o.cropName} ({o.quantityKg} kg)
                </option>
              ))}
            </select>
          )}

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
            title="Share Live Tracking on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp Update</span>
          </a>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 bg-emerald-100 text-emerald-950 font-bold text-xs rounded-xl border border-emerald-300 flex items-center justify-between animate-in fade-in duration-150">
          <span>✓ {statusFeedback}</span>
        </div>
      )}

      {/* 9-Stage Visual Progress Chain */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div 
              key={stage.key}
              className={`p-2.5 rounded-2xl text-center border transition-all flex flex-col items-center justify-center ${
                isCurrent 
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20' 
                  : (isDone ? 'bg-slate-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400')
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                isCurrent 
                  ? 'bg-emerald-600 text-white' 
                  : (isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400')
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-bold block leading-tight ${
                isCurrent ? 'text-emerald-800 font-black' : (isDone ? 'text-slate-800' : 'text-slate-400')
              }`}>
                {stage.label}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {stage.labelHi}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Stage & Status Card */}
      {selectedOrder ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-white rounded-2xl p-5 border border-emerald-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Current Status: {stages[activeIdx]?.label}
                </span>
                <h4 className="text-base font-black text-slate-900 mt-1">
                  🤝 Deal #{selectedOrder.orderNumber}: {selectedOrder.quantityKg} kg {selectedOrder.cropName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Farmer: <strong>{selectedOrder.farmerName}</strong> • Buyer: <strong>{selectedOrder.buyerBusiness || selectedOrder.buyerName}</strong> • Rate: <strong>₹{selectedOrder.pricePerQuintal}/qtl</strong>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Value (Escrow Protected)</span>
              <span className="text-xl font-black text-emerald-700">
                ₹{(selectedOrder.totalGrossAmount || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                Status: {selectedOrder.paymentStatus || 'Escrow Funded'}
              </span>
            </div>
          </div>

          {/* Interactive Stage Advancement Controls (Live Action Bar) */}
          {nextAction ? (
            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Update Live Tracking Milestone (अगला चरण अपडेट करें)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Visible to both Buyer & Farmer live
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={checkpointLocation}
                  onChange={(e) => setCheckpointLocation(e.target.value)}
                  placeholder={`Location (e.g. ${nextAction.defaultLoc})`}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={checkpointNote}
                  onChange={(e) => setCheckpointNote(e.target.value)}
                  placeholder={`Note (e.g. ${nextAction.defaultNote})`}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleAdvanceStage}
                disabled={updatingStage}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {updatingStage ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting tracking update...</span>
                  </>
                ) : (
                  <>
                    <span>{nextAction.buttonText}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center">
              🎉 Order Successfully Completed! Full payment released to farmer and 5-star trust rating recorded.
            </div>
          )}

          {/* Chronological Milestone Timeline Log */}
          {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
            <div className="pt-2 border-t border-emerald-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Live Audit & Timeline History:
              </span>
              <div className="space-y-2">
                {selectedOrder.timeline.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">{t.stage}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{t.note}</p>
                      {t.location && (
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          📍 {t.location} • By {t.updatedBy?.name || 'Platform'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500 space-y-2">
          <Truck className="w-8 h-8 mx-auto text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700">No active harvest delivery contract currently open.</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Once a farmer accepts a procurement bid or a buyer confirms a deal, live digital dispatch, electronic weighment, and payment releases will update here in real time.
          </p>
        </div>
      )}

    </div>
  );
}
