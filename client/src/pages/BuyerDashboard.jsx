import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Store, 
  ShieldCheck, 
  Search, 
  Send, 
  Handshake, 
  Truck, 
  Clock, 
  Star,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import HarvestJourney from '../components/HarvestJourney';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'offers', 'orders'
  const [selectedListing, setSelectedListing] = useState(null);
  const [offerPrice, setOfferPrice] = useState('4600');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchListings();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      }
    } catch {
      setOrders([]);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings');
      if (res.data.success) {
        setListings(res.data.listings);
        if (res.data.listings.length > 0) setSelectedListing(res.data.listings[0]);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  };

  const handlePlaceOffer = async (e) => {
    e.preventDefault();
    if (!selectedListing) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/offers', {
        listingId: selectedListing._id,
        cropName: selectedListing.cropName,
        quantityKg: selectedListing.quantityKg,
        offeredPricePerQuintal: Number(offerPrice)
      });
      if (res.data.success) {
        setSuccessMsg(`Offer of ₹${offerPrice}/qtl sent to ${selectedListing.farmerName}!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.data.message || 'Failed to place offer. Please try again.');
      }
    } catch (err) {
      console.error('Failed to place offer:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to place offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> GST & Mandi Licensed Buyer
            </span>
            <span className="text-xs text-slate-300">
              {user?.state ? `${user.district || ''}, ${user.state}` : 'National Procurement Portal'} • Escrow Facility Enabled
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            🏢 {user?.buyerDetails?.businessName || user?.name || 'Verified Agribusiness Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Buyer Representative: <strong>{user?.name || 'Authorized Buyer'}</strong> • Trust Score: <strong className="text-amber-400">{user?.buyerDetails?.trustScore || 92}/100 (Audited)</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Escrow Balance</span>
            <p className="text-xl font-black text-emerald-400">₹{(user?.buyerDetails?.escrowBalance || 500000).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeTab === 'browse' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Browse Farmgate Harvest Lots ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeTab === 'orders' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Purchases & Transport Tracking
        </button>
      </div>

      {activeTab === 'browse' && (
        listings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Listings List */}
            <div className="lg:col-span-2 space-y-3">
              {listings.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedListing(item)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    selectedListing?._id === item._id
                      ? 'bg-emerald-50/40 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {item.grade}
                      </span>
                      <h3 className="font-black text-base text-slate-900 mt-1">{item.cropName} ({item.quantityKg} kg)</h3>
                      <p className="text-xs text-slate-500 font-medium">Farmer: <strong>{item.farmerName}</strong> • {item.location?.village}, {item.location?.district}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Asking Price</span>
                      <p className="text-base font-black text-emerald-700">₹{item.expectedPricePerQuintal}/qtl</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-slate-600">
                    <span>Moisture: <strong>{item.moisturePercent}%</strong></span>
                    <span>Quality AI Confidence: <strong>{item.qualityConfidence}%</strong></span>
                    <span className="text-emerald-700 font-bold">Ready for Pickup</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Offer Placement Card */}
            {selectedListing && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md h-fit space-y-4">
                <div className="border-b pb-3">
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Place Verified Offer
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Offer to {selectedListing.farmerName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedListing.quantityKg} kg of {selectedListing.cropName} • {selectedListing.grade}
                  </p>
                </div>

                <form onSubmit={handlePlaceOffer} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Your Bid Price (₹ / quintal)
                    </label>
                    <input
                      type="number"
                      step="25"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Total Gross Value: ₹{(Number(offerPrice) * (selectedListing.quantityKg / 100)).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                    <p>✓ 100% Escrow Funded</p>
                    <p>✓ Buyer Arranges Pickup from Farm</p>
                    <p>✓ Electronic Weighment verified</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl shadow-sm text-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Sending Offer...' : 'Send Legally Binding Offer'}</span>
                  </button>
                </form>

                {successMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 font-bold rounded-xl text-xs text-center">
                    {successMsg}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-rose-100 text-rose-900 font-bold rounded-xl text-xs text-center">
                    {errorMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center space-y-2">
            <div className="text-4xl">🌾</div>
            <h4 className="font-bold text-slate-800 text-base">No crop listings available yet.</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Farmer crop listings ready for procurement will appear here as soon as registered producers list their harvest lots.
            </p>
          </div>
        )
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <HarvestJourney />
        </div>
      )}

    </div>
  );
}
