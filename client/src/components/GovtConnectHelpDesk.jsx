import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Send,
  AlertCircle,
  FileCheck2,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function GovtConnectHelpDesk() {
  const { user } = useAuth();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Grievance Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('PM-KISAN Installment Not Credited');
  const [description, setDescription] = useState('');
  const [submittedGrievance, setSubmittedGrievance] = useState(null);
  const [grievanceLoading, setGrievanceLoading] = useState(false);

  // Grievance Tracker State
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedGrievance, setTrackedGrievance] = useState(null);

  useEffect(() => {
    fetchOffices();
  }, [user?.state, user?.district]);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user?.state) params.append('state', user.state);
      if (user?.district) params.append('district', user.district);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/schemes/offices${qs}`);
      if (res.data.success) {
        setOffices(res.data.offices);
      }
    } catch (err) {
      console.error('Failed to load offices:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitGrievance = async (e) => {
    e.preventDefault();
    if (!subject || !description) return;
    setGrievanceLoading(true);

    try {
      const res = await api.post('/schemes/grievance', {
        category,
        subject,
        description,
        state: user?.state || '',
        district: user?.district || 'General'
      });
      if (res.data.success) {
        setSubmittedGrievance(res.data.grievance);
        setSubject('');
        setDescription('');
      }
    } catch (err) {
      console.error('Grievance submission error:', err);
    } finally {
      setGrievanceLoading(false);
    }
  };

  const [trackError, setTrackError] = useState('');

  const trackGrievance = async () => {
    if (!searchTrackingId) return;
    setTrackError('');
    setTrackedGrievance(null);
    try {
      const res = await api.get(`/schemes/grievance/${searchTrackingId.trim()}`);
      if (res.data.success) {
        setTrackedGrievance(res.data.grievance);
      }
    } catch (err) {
      setTrackError('Grievance not found. Please check tracking ID (e.g. GRV-MP-XXXXXX).');
    }
  };


  return (
    <div className="space-y-8">
      
      {/* Official Directory Section */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Government Connect
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Department Contacts
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            District Agriculture Officers & Help Desks {user?.district ? `(${user.district} Division)` : '(Regional)'}
          </h3>
          <p className="text-xs text-slate-500">
            Official nodal contacts for Krishi Vigyan Kendra, PM-KISAN, and APMC Mandi assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offices.map((office, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {office.officeType}
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-2 leading-snug">
                  {office.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {office.department}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t pt-2.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800">{office.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{office.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{office.workingHours}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 leading-tight">{office.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Toll-Free: <strong>{office.tollFreeHelpline}</strong>
                </span>
                <a
                  href={office.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grievance Submission & Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Raise Grievance Form */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
              Citizen Redressal
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Raise a Formal Agriculture Grievance (शिकायत दर्ज करें)
            </h3>
            <p className="text-xs text-slate-500">
              Submit claim delays, mandi disputes, or PM-KISAN issues directly to the District Agriculture Office.
            </p>
          </div>

          <form onSubmit={submitGrievance} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grievance Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="PM-KISAN Installment Not Credited">PM-KISAN Installment Not Credited</option>
                <option value="Crop Insurance Claim Delay">Crop Insurance (PMFBY) Claim Delay</option>
                <option value="Mandi Weighment Dispute">Mandi Weighment / Payment Delay</option>
                <option value="Fertilizer Availability">Fertilizer / Urea Availability</option>
                <option value="Soil Health Card Delay">Soil Health Card Lab Delay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject / Headline
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g., 14th PM-KISAN installment pending Aadhaar seeding"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Description & Khasra / Account Details
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide survey number, bank branch, or mandi lot ID for faster resolution..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={grievanceLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{grievanceLoading ? 'Submitting to Nodal Officer...' : 'Submit Grievance with Tracking ID'}</span>
            </button>
          </form>

          {/* Submission Success Alert */}
          {submittedGrievance && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Grievance Lodged Successfully!</span>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                Your Tracking Number: <strong className="text-emerald-700 font-black">{submittedGrievance.trackingNumber}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Assigned to: {submittedGrievance.assignedOfficer}. Status: <strong>{submittedGrievance.status}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Track Grievance Status */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                Status Check
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Track Existing Grievance (स्थिति जानें)
              </h3>
              <p className="text-xs text-slate-500">
                Enter your official tracking ID to view action taken reports.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                placeholder="GRV-MP-..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
              <button
                onClick={trackGrievance}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
              </button>
            </div>

            {trackError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
                {trackError}
              </p>
            )}


            {trackedGrievance && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 animate-in fade-in-50">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Tracking ID</span>
                    <span className="font-mono font-black text-sm text-emerald-800">{trackedGrievance.trackingNumber}</span>
                  </div>
                  <span className={`font-black px-2.5 py-1 rounded-full text-[10px] tracking-wide ${
                    trackedGrievance.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : trackedGrievance.status === 'Action Taken' || trackedGrievance.status === 'Under Review'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : trackedGrievance.status === 'Rejected'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    ● {trackedGrievance.status}
                  </span>
                </div>

                {/* Grievance Progress Pipeline */}
                <div className="grid grid-cols-3 gap-1 py-1 text-center text-[10px]">
                  <div className={`p-1.5 rounded-lg font-bold ${
                    trackedGrievance.status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    1. Submitted
                  </div>
                  <div className={`p-1.5 rounded-lg font-bold ${
                    trackedGrievance.status === 'Under Review' || trackedGrievance.status === 'Action Taken' || trackedGrievance.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    2. In Review
                  </div>
                  <div className={`p-1.5 rounded-lg font-bold ${
                    trackedGrievance.status === 'Resolved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    3. Resolved
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                  <p><strong>Subject:</strong> {trackedGrievance.subject}</p>
                  <p><strong>Category:</strong> <span className="text-slate-900 font-semibold">{trackedGrievance.category}</span></p>
                  {trackedGrievance.farmerName && (
                    <p><strong>Applicant:</strong> {trackedGrievance.farmerName}</p>
                  )}
                  {trackedGrievance.department && (
                    <p><strong>Department:</strong> {trackedGrievance.department}</p>
                  )}
                  <p><strong>Assigned Officer:</strong> <span className="text-emerald-700 font-semibold">{trackedGrievance.assignedOfficer || 'District Agricultural Grievance Officer'}</span></p>
                </div>

                {/* Official Response from Admin / Nodal Officer */}
                {trackedGrievance.officialResponse && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Official Action / Resolution Report
                    </span>
                    <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                      "{trackedGrievance.officialResponse}"
                    </p>
                  </div>
                )}

                <p className="text-slate-400 text-[10px] pt-1 text-right">
                  Filed on: {new Date(trackedGrievance.filingDate).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 mt-4">
            📞 Need immediate assistance? Call the national Kisan Call Centre toll-free at <strong>1800-180-1551</strong> (6:00 AM - 10:00 PM all 7 days).
          </div>
        </div>

      </div>

    </div>
  );
}
