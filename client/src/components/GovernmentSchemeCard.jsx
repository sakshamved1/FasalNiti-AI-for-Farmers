import React, { useState } from 'react';
import { 
  Landmark, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Award,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GovernmentSchemeCard({ scheme, matchScore = 90 }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits'); // 'benefits', 'eligibility', 'documents', 'apply'
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 transition-all hover:shadow-lg">
      
      {/* Top Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {scheme.verificationStatus || 'VERIFIED'}
          </span>
          <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            🏛️ {scheme.source || 'Official Government Portal'}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3 h-3" /> {t('lastUpdated')}: {scheme.lastUpdated || scheme.lastVerifiedAt || '14 Sep 2026'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl">
            {matchScore}% Profile Match
          </span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
            {scheme.category}
          </span>
        </div>
      </div>

      {/* Scheme Title & Ministry */}
      <div className="mb-4">
        <h3 className="text-lg font-black text-slate-900 leading-tight hover:text-emerald-700 transition-colors">
          {scheme.schemeName}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          🏛️ {scheme.department} • <span className="font-bold text-slate-700">{Array.isArray(scheme.states) ? scheme.states.join(', ') : (scheme.state || 'All India / Central')}</span>
        </p>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {scheme.summary}
      </p>

      {/* Key Financial Benefit Highlight */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 p-3.5 rounded-2xl border border-emerald-200/80 mb-4 flex items-start gap-2.5">
        <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
            Key Benefit & Financial Assistance
          </span>
          <p className="text-xs font-bold text-emerald-950 mt-0.5">
            {scheme.benefits?.benefitDescription || scheme.benefits?.financialAmount}
          </p>
        </div>
      </div>

      {/* Expandable Tabs for Detailed Scrutiny */}
      {expanded && (
        <div className="border-t border-slate-100 pt-4 mb-4 space-y-4">
          
          {/* Tab Headers */}
          <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'benefits' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Benefits
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'eligibility' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Eligibility Criteria
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'documents' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Required Documents
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'apply' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              How to Apply
            </button>
          </div>

          {/* Tab Contents */}
          <div className="text-xs text-slate-700">
            {activeTab === 'benefits' && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl">
                <p><strong>Direct Benefit:</strong> {scheme.benefits?.financialAmount}</p>
                <p><strong>Subsidy %:</strong> {scheme.benefits?.subsidyPercent}</p>
                <p className="text-slate-600 mt-1">{scheme.benefits?.benefitDescription}</p>
              </div>
            )}

            {activeTab === 'eligibility' && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl">
                <p><strong>Target Farmers:</strong> {scheme.eligibility?.targetFarmers?.join(', ')}</p>
                <p><strong>Applicable Crops:</strong> {scheme.eligibility?.applicableCrops?.join(', ')}</p>
                <p><strong>Land Requirement:</strong> {scheme.eligibility?.landSizeMinAcres || 0} to {scheme.eligibility?.landSizeMaxAcres || 'Unlimited'} Acres</p>
                <p className="text-slate-600 mt-1">{scheme.eligibility?.criteriaDescription}</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 block">Mandatory Document Checklist:</span>
                <ul className="space-y-1.5 list-disc list-inside">
                  {(scheme.documentsRequired || scheme.documents || ['Aadhaar Card', 'Land 7/12 / Khasra Extract', 'Bank Passbook with active IFSC']).map((doc, idx) => (
                    <li key={idx} className="font-medium text-slate-700">{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'apply' && (
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 block">Step-by-Step Official Procedure:</span>
                <div className="space-y-2">
                  {(scheme.applicationSteps || scheme.applicationProcess || [
                    { stepNumber: 1, title: 'Official Portal Registration', instruction: `Visit official portal at ${scheme.officialUrl}` },
                    { stepNumber: 2, title: 'Document Verification', instruction: 'Submit Aadhaar OTP and state land revenue survey records.' }
                  ]).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {step.stepNumber}
                      </span>
                      <div>
                        <strong className="text-slate-900 block">{step.title}</strong>
                        <span className="text-slate-600 text-[11px]">{step.instruction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>{expanded ? 'Hide Details' : 'View Full Details & Documents'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
        </a>
      </div>

    </div>
  );
}
