import React, { useState, useEffect } from 'react';
import { GraduationCap, Edit3, Check } from 'lucide-react';

export const ACADEMIC_YEAR_PRESETS = [
  '১ম বর্ষ',
  '২য় বর্ষ',
  '৩য় বর্ষ',
  '৪র্থ বর্ষ',
  'অনার্স ১ম বর্ষ (২০২৪-২৫)',
  'অনার্স ২য় বর্ষ (২০২৩-২৪)',
  'অনার্স ৩য় বর্ষ (২০২২-২৩)',
  'অনার্স ৪র্থ বর্ষ (২০২১-২২)',
  'এইচএসসি ১ম বর্ষ (২০২৪-২৬)',
  'এইচএসসি ২য় বর্ষ (২০২৩-২৫)',
  'মাস্টার্স',
  'ডিগ্রি ১ম বর্ষ',
  'ডিগ্রি ২য় বর্ষ',
  'ডিগ্রি ৩য় বর্ষ',
  'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং',
  'সেশন ২০২৪-২০২৫',
  'সেশন ২০২৩-২০২৪',
  'সেশন ২০২২-২০২৩',
  'সেশন ২০২১-২০২২',
  'সেশন ২০২০-২০২১',
  'সেশন ২০১৯-২০২০',
];

// Helper to normalize Bengali strings (combining vs precomposed forms)
const normalizeBangla = (text: string): string => {
  if (!text) return '';
  return text.normalize('NFC').replace(/য়/g, 'য়').trim();
};

interface AcademicYearSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export const AcademicYearSelector: React.FC<AcademicYearSelectorProps> = ({
  value,
  onChange,
  label = 'শিক্ষাবর্ষ / সেশন',
  required = false,
}) => {
  const normalizedValue = normalizeBangla(value);
  const matchedPreset = ACADEMIC_YEAR_PRESETS.find(
    (p) => normalizeBangla(p) === normalizedValue
  );

  const [isCustomMode, setIsCustomMode] = useState<boolean>(!matchedPreset && Boolean(value));
  const [customInputValue, setCustomInputValue] = useState<string>(value || '');

  // Keep state synchronized if external value changes
  useEffect(() => {
    if (value) {
      const match = ACADEMIC_YEAR_PRESETS.find(
        (p) => normalizeBangla(p) === normalizeBangla(value)
      );
      if (match) {
        setIsCustomMode(false);
      } else {
        setIsCustomMode(true);
        setCustomInputValue(value);
      }
    }
  }, [value]);

  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__CUSTOM__') {
      setIsCustomMode(true);
      if (!customInputValue) {
        setCustomInputValue('');
      }
    } else {
      setIsCustomMode(false);
      onChange(selected);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setCustomInputValue(nextVal);
    onChange(nextVal);
  };

  const switchToPreset = () => {
    setIsCustomMode(false);
    const fallback = ACADEMIC_YEAR_PRESETS[0];
    onChange(fallback);
  };

  const switchToCustom = () => {
    setIsCustomMode(true);
    if (!customInputValue && value) {
      setCustomInputValue(value);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {isCustomMode ? (
          <button
            type="button"
            onClick={switchToPreset}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <GraduationCap className="w-3 h-3" />
            <span>তালিকা থেকে বেছে নিন</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={switchToCustom}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>নিজে লিখুন</span>
          </button>
        )}
      </div>

      {!isCustomMode ? (
        <div className="relative">
          <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <select
            value={matchedPreset || (value ? '__CUSTOM__' : ACADEMIC_YEAR_PRESETS[0])}
            onChange={handleDropdownSelect}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
          >
            {ACADEMIC_YEAR_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
            <option value="__CUSTOM__">✏️ অন্য শিক্ষাবর্ষ (নিজে লিখুন)...</option>
          </select>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required={required}
              value={customInputValue}
              onChange={handleCustomChange}
              placeholder="যেমন: ৩য় বর্ষ, সেশন ২০১৯-২০ বা অনার্স ৪র্থ বর্ষ"
              className="w-full pl-10 pr-9 py-2 bg-white border border-indigo-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
              autoFocus
            />
            {customInputValue && (
              <span className="absolute right-3 top-2.5 text-emerald-600">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            আপনার সঠিক শ্রেণি বা সেশন লিখুন। এটি আপনার প্রোফাইলে প্রদর্শিত হবে।
          </p>
        </div>
      )}
    </div>
  );
};
