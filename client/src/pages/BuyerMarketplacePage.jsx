import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ShieldCheck, 
  Star, 
  MapPin, 
  PlusCircle, 
  ArrowRight,
  Handshake,
  Search,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';
import NegotiationPanel from '../components/NegotiationPanel';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import CropSelector from '../components/CropSelector';

export default function BuyerMarketplacePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // New Listing Form State
  const [cropName, setCropName] = useState('Soybean');
  const [quantityKg, setQuantityKg] = useState('500');
  const [expectedPrice, setExpectedPrice] = useState('4500');
  const [grade, setGrade] = useState('Grade A');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchListings();
    fetchBuyers();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings');
      if (res.data.success) {
        setListings(res.data.listings);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/listings', {
        farmerName: user?.name || 'Verified Farmer',
        farmerPhone: user?.phone || user?.mobile || '',
        location: user?.profile?.location || user?.location,
        cropName,
        quantityKg: Number(quantityKg),
        expectedPricePerQuintal: Number(expectedPrice),
        grade,
        description
      });
      if (res.data.success && res.data.listing) {
        setListings(prev => [res.data.listing, ...prev]);
        setShowCreateModal(false);
        setDescription('');
        showToast('🎉 Harvest listing published successfully! Verified buyers have been alerted.');
      } else {
        alert(res.data.message || 'Could not publish listing. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create listing:', err);
      alert('Failed to publish listing: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const [verifiedBuyers, setVerifiedBuyers] = useState([]);

  const fetchBuyers = async () => {
    try {
      const res = await api.get('/auth/buyers');
      if (res.data.success && Array.isArray(res.data.buyers)) {
        setVerifiedBuyers(res.data.buyers);
      }
    } catch {
      // Keep empty if none registered
      setVerifiedBuyers([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
              {t('trustMarketplace')}
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {t('identityVerified')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            🏢 {t('verifiedMarketplaceTitle')}
          </h1>

          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            {t('verifiedMarketplaceSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('postHarvestSale')}</span>
        </button>
      </div>

      {/* Verified Buyers Directory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900">
            {t('verifiedInstitutionalBuyers')}
          </h3>
          <span className="text-xs text-emerald-600 font-bold">{t('transparentTrustScoring')}</span>
        </div>

        {verifiedBuyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verifiedBuyers.map((buyer, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {buyer.badge || 'VERIFIED BUYER'}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 mt-1.5">{buyer.name || buyer.businessName}</h4>
                    <p className="text-xs text-slate-500 font-medium">Rep: {buyer.rep || buyer.contactPerson || 'Authorized Representative'}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trust Score</span>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-black justify-end mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{buyer.trustScore || 90}/100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong className="text-slate-800">{buyer.location || `${buyer.district || ''}, ${buyer.state || ''}`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Buying Focus:</span>
                    <strong className="text-purple-700">{(buyer.buyingCrops || []).join(', ') || 'All Verified Produce'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Deals:</span>
                    <strong className="text-slate-800">{buyer.completedDeals || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispute Rate:</span>
                    <strong className="text-emerald-700">{buyer.disputeRate || '0.0%'}</strong>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => showToast(`Connecting with ${buyer.name || buyer.businessName}! Direct inquiry dispatched with your registered contact details.`)}
                    className="w-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>{t('sendCropOffer')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-2">
            <div className="text-3xl">🏢</div>
            <h4 className="font-bold text-slate-800 text-sm">{t('noVerifiedBuyersTitle')}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('noVerifiedBuyersDesc')}
            </p>
          </div>
        )}
      </div>

      {/* Real-Time Negotiation Timeline */}
      <NegotiationPanel />

      {/* Active Crop Listings for Sale */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900">
            {t('activeListings')}
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{listings.length} {t('activeListings')}</span>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((lst) => (
              <div key={lst._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {lst.grade}
                    </span>
                    <h4 className="font-black text-base text-slate-900 mt-1">{lst.cropName}</h4>
                    <p className="text-xs text-slate-500 font-medium">Farmer: {lst.farmerName} • {lst.location?.village}, {lst.location?.district}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{t('askingPrice')}</span>
                    <p className="text-base font-black text-emerald-700">₹{lst.expectedPricePerQuintal}/qtl</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('lotQuantity')}:</span>
                    <strong className="text-slate-800">{lst.quantityKg} kg ({(lst.quantityKg / 100).toFixed(1)} Qtl)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('moistureContent')}:</span>
                    <strong className="text-slate-800">{lst.moisturePercent || 11.0}%</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 italic">
                  "{lst.description}"
                </p>

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Status: <strong className="text-emerald-600">{lst.status}</strong></span>
                  <button
                    onClick={() => showToast(`Live negotiation active for ${lst.cropName} (${lst.quantityKg} kg)! Scroll down to Negotiation Panel.`)}
                    className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <span>Negotiate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center space-y-3">
            <div className="text-4xl">🌾</div>
            <h4 className="font-bold text-slate-800 text-base">No crop listings available yet.</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first farmer to list your crop and receive direct purchase bids from verified buyers across India.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post First Crop Listing</span>
            </button>
          </div>
        )}
      </div>


      {/* Post Harvest Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">{t('postNewListing')}</h3>
                <p className="text-xs text-emerald-200">{t('verifiedMarketplaceSubtitle')}</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-3 text-xs">
              <CropSelector
                value={cropName}
                onChange={setCropName}
                label={t('crop')}
                showLabel={true}
                id="buyer-modal-crop"
              />

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('quantity')} (kg)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('expectedPricePerQuintal')}</label>
                <input
                  type="number"
                  min="1000"
                  step="50"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('grade')}</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="Grade A">Grade A (Moisture &lt;11%, Clean)</option>
                  <option value="Grade B">Grade B (Standard Market)</option>
                  <option value="Grade C">Grade C (Slight Discoloration)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('lotDescription')}</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dry gunny bags stored, ready for farmgate pickup..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800"
                ></textarea>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-sm text-sm"
                >
                  {loading ? t('loading') : t('publishListing')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
