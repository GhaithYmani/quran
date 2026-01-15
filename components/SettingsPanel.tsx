
import React from 'react';
import { PlayerSettings } from '../types';
import { RECITERS } from '../services/quranService';
import { Settings, RefreshCw, Clock, Mic2, ArrowLeftRight, Plus, Minus } from 'lucide-react';

interface SettingsPanelProps {
  settings: PlayerSettings;
  maxAyahs: number;
  onUpdate: (newSettings: PlayerSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, maxAyahs, onUpdate }) => {
  const handleChange = (key: keyof PlayerSettings, value: number) => {
    onUpdate({ ...settings, [key]: value });
  };

  const increment = (key: 'startAyah' | 'endAyah', max: number) => {
    const newValue = Math.min(settings[key] + 1, max);
    if (key === 'startAyah' && newValue > settings.endAyah) return;
    handleChange(key, newValue);
  };

  const decrement = (key: 'startAyah' | 'endAyah', min: number) => {
    const newValue = Math.max(settings[key] - 1, min);
    if (key === 'endAyah' && newValue < settings.startAyah) return;
    handleChange(key, newValue);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2 mb-6 text-emerald-800 border-b border-slate-100 pb-3">
        <Settings className="w-5 h-5" />
        <h3 className="font-bold text-lg">إعدادات الحفظ والتكرار</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-emerald-600" />
            القارئ
          </label>
          <div className="relative">
            <select
              value={settings.reciterId}
              onChange={(e) => handleChange('reciterId', parseInt(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-medium text-slate-700"
            >
              {RECITERS.map(reciter => (
                <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
           <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            نطاق الآيات
          </label>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="flex items-center flex-1 justify-between bg-white rounded-lg shadow-sm px-2 py-1">
                <button onClick={() => decrement('startAyah', 1)} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                <div className="text-center">
                    <span className="text-[10px] text-slate-400 block">من</span>
                    <span className="font-bold text-lg text-emerald-800">{settings.startAyah}</span>
                </div>
                <button onClick={() => increment('startAyah', settings.endAyah)} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            
            <div className="flex items-center flex-1 justify-between bg-white rounded-lg shadow-sm px-2 py-1">
                <button onClick={() => decrement('endAyah', settings.startAyah)} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                <div className="text-center">
                    <span className="text-[10px] text-slate-400 block">إلى</span>
                    <span className="font-bold text-lg text-emerald-800">{settings.endAyah}</span>
                </div>
                <button onClick={() => increment('endAyah', maxAyahs)} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            تكرار الآية: <span className="text-emerald-600 font-extrabold text-lg mr-1">{settings.ayahRepetitions}</span> مرات
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={settings.ayahRepetitions}
            onChange={(e) => handleChange('ayahRepetitions', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            سكتة (ثواني): <span className="text-emerald-600 font-extrabold text-lg mr-1">{settings.delayBetweenAyahs}</span> ثانية
          </label>
          <input
              type="range"
              min={0}
              max={10}
              value={settings.delayBetweenAyahs}
              onChange={(e) => handleChange('delayBetweenAyahs', parseInt(e.target.value) || 0)}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
        </div>
      </div>
    </div>
  );
};
