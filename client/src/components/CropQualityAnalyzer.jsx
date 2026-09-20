import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Droplet, 
  ShieldCheck,
  RotateCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import CropSelector from './CropSelector';

export default function CropQualityAnalyzer() {
  const [cropName, setCropName] = useState('Soybean');
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, or WebP).');
        return;
      }
      setErrorMsg('');
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runQualityScan = async () => {
    if (!selectedImage) {
      setErrorMsg('Please upload or take a photograph of your crop first.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await api.post('/ai/quality', {
        cropName,
        imageBase64: selectedImage,
        filename: 'harvest_sample.jpg'
      });
      if (res.data.success) {
        setResult(res.data.quality);
      } else {
        setErrorMsg(res.data.message || 'Failed to analyze crop image.');
      }
    } catch (err) {
      console.error('Failed to analyze quality:', err);
      setErrorMsg(err.response?.data?.message || 'Server connection error during image analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
      
      {/* Header with CropSelector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                AI Vision Assaying
              </span>
              <span className="text-xs font-semibold text-slate-500">Real Produce Verification</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              AI Crop Quality & Grade Scanner
            </h3>
          </div>
        </div>

        {/* Dynamic Crop Selector with "Other" and Custom Input */}
        <div className="w-full lg:w-72">
          <CropSelector
            value={cropName}
            onChange={(c) => {
              setCropName(c);
              setResult(null);
            }}
            label="Select Crop Variety:"
            showLabel={true}
            id="analyzer-crop-selector"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload / Camera Box */}
        <div className="space-y-3">
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors relative flex flex-col items-center justify-center min-h-[220px]">
            {selectedImage ? (
              <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-inner bg-slate-900 flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt="Harvest Sample Preview" 
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleClear}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Remove / Change</span>
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2.5">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-black text-slate-800">
                  Upload Grain Photo or Take a Picture
                </p>
                <p className="text-[11px] text-slate-500 mt-1 mb-3 max-w-xs mx-auto leading-normal">
                  Place 20–30 clean grains or produce sample on a clean white surface with clear lighting
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="crop-photo-upload"
                />
                <label
                  htmlFor="crop-photo-upload"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo / Image</span>
                </label>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">
              Authentic Produce Check Active
            </span>

            <button
              onClick={runQualityScan}
              disabled={analyzing || !selectedImage}
              className={`text-xs font-black px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 ${
                !selectedImage || analyzing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {analyzing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying crop & grading...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Produce Vision Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Results Panel */}
        <div>
          {result ? (
            result.isCrop === false ? (
              /* Non-Crop Rejection Card (NO FAKE DATA) */
              <div className="bg-amber-50/90 rounded-2xl p-5 border-2 border-amber-300 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      Non-Crop Image Detected
                    </span>
                    <h4 className="text-base font-black text-amber-950 mt-1">
                      Verification Not Passed
                    </h4>
                    {result.detectedObject && (
                      <p className="text-xs font-bold text-amber-800 mt-0.5">
                        Detected: <span className="underline">{result.detectedObject}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2 leading-relaxed font-medium">
                  <p className="font-bold text-slate-800">
                    ⚠️ {result.rejectionReason}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    FasalNiti AI strictly requires genuine photographs of agricultural grains, seeds, pulses, fruits, or vegetables to prevent incorrect assaying and fraudulent trades.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-amber-800">
                    Please upload an authentic photo of your {cropName} harvest.
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-xs font-extrabold text-amber-900 underline hover:text-amber-700"
                  >
                    Try Another Photo
                  </button>
                </div>
              </div>
            ) : (
              /* Verified Genuine Crop Assaying Card */
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Assessed Quality
                      </span>
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                        {result.visionSource || 'Verified Crop Lot'}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-emerald-700 mt-0.5 flex items-center gap-2">
                      <span>{result.grade}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {result.confidence}% Confidence
                      </span>
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Price Impact</span>
                    <p className="text-xs font-black text-emerald-700">{result.marketPriceImpact}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Moisture Content</span>
                    <span className="font-extrabold text-slate-800">{result.metrics.moistureEstimatePercent}%</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">(Safe limit &le;12%)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Foreign Matter</span>
                    <span className="font-extrabold text-slate-800">{result.metrics.foreignMatterPercent}%</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">(Permissible FAQ limit)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Damaged Grains</span>
                    <span className="font-extrabold text-slate-800">{result.metrics.damagedGrainsPercent}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Uniformity Score</span>
                    <span className="font-extrabold text-slate-800">{result.metrics.uniformityScore}/100</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Vision Observations ({result.cropName}):
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {result.defectsDetected?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium">
                  💡 <strong>Recommendation:</strong> {result.recommendation}
                </div>

                <div className="p-2 bg-slate-100 rounded-lg text-[10px] text-slate-500 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p>{result.disclaimer}</p>
                </div>

              </div>
            )
          ) : (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
              <Camera className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">
                No Produce Scanned Yet
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Upload a sample photo of your {cropName} grains or produce to run AI produce validation and grade estimation.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
