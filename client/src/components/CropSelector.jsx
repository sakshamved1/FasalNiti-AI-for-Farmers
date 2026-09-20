import React, { useState, useEffect } from 'react';
import { CROP_CATEGORIES, CROP_MASTER_LIST, findCropByName } from '../data/cropMaster';
import { Sprout, Edit3, Check } from 'lucide-react';

export default function CropSelector({
  value = '',
  onChange,
  label = '',
  placeholder = 'Type your custom crop name / अपनी फसल लिखें...',
  className = '',
  selectClassName = '',
  id = 'crop-selector',
  required = false,
  showLabel = true,
  includeOther = true
}) {
  const isPredefined = CROP_MASTER_LIST.some(c => c.name.toLowerCase() === (value || '').toLowerCase() && c.id !== 'other');
  
  const [selectedKey, setSelectedKey] = useState(
    isPredefined ? value : (value ? 'other' : 'Soybean')
  );
  const [customCrop, setCustomCrop] = useState(isPredefined ? '' : value);

  useEffect(() => {
    if (!value) return;
    const matched = CROP_MASTER_LIST.find(c => c.name.toLowerCase() === value.toLowerCase() && c.id !== 'other');
    if (matched) {
      setSelectedKey(matched.name);
      setCustomCrop('');
    } else {
      setSelectedKey('other');
      setCustomCrop(value);
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const nextVal = e.target.value;
    setSelectedKey(nextVal);

    if (nextVal === 'other') {
      onChange && onChange(customCrop.trim() || 'Other');
    } else {
      setCustomCrop('');
      onChange && onChange(nextVal);
    }
  };

  const handleCustomInputChange = (e) => {
    const text = e.target.value;
    setCustomCrop(text);
    onChange && onChange(text);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          value={selectedKey}
          onChange={handleSelectChange}
          required={required}
          className={`w-full bg-white border border-slate-300 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition-all outline-none shadow-xs ${selectClassName}`}
        >
          {CROP_CATEGORIES.filter(cat => cat.id !== 'OTHER').map(cat => {
            const catCrops = CROP_MASTER_LIST.filter(c => c.category === cat.id);
            if (catCrops.length === 0) return null;
            return (
              <optgroup key={cat.id} label={`${cat.nameEn} • ${cat.nameHi}`}>
                {catCrops.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.hindiName})
                  </option>
                ))}
              </optgroup>
            );
          })}

          {includeOther && (
            <optgroup label="Custom / अन्यान्य">
              <option value="other">
                ✍️ Other / अन्य (Type your own crop)
              </option>
            </optgroup>
          )}
        </select>
      </div>

      {/* Dynamic Text Input when "Other" is selected */}
      {selectedKey === 'other' && (
        <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-emerald-600 pointer-events-none">
              <Sprout className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={customCrop}
              onChange={handleCustomInputChange}
              placeholder={placeholder}
              required={required}
              autoFocus
              className="w-full bg-emerald-50/50 border-2 border-emerald-500/80 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 rounded-xl pl-9 pr-8 py-2 text-xs font-extrabold text-emerald-950 placeholder-emerald-700/50 shadow-xs outline-none transition-all"
            />
            {customCrop.trim().length > 0 && (
              <div className="absolute right-2.5 text-emerald-600 pointer-events-none">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold px-1 mt-1 flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            <span>Custom crop specified: <strong>{customCrop || 'Type above...'}</strong></span>
          </p>
        </div>
      )}
    </div>
  );
}
