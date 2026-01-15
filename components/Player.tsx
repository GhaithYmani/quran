
import React, { useState, useEffect, useRef } from 'react';
import { Ayah, PlayerSettings } from '../types';
import { Play, Pause, SkipBack, SkipForward, BookOpen, Check } from 'lucide-react';
import { getTafsir } from '../services/geminiService';
import { RECITERS } from '../services/quranService';

interface PlayerProps {
  verses: Ayah[];
  settings: PlayerSettings;
  surahName: string;
  memorizedKeys: Record<string, boolean>;
  onToggleMemorized: (verseKey: string) => void;
  onComplete?: () => void;
}

export const Player: React.FC<PlayerProps> = ({ verses, settings, surahName, memorizedKeys, onToggleMemorized, onComplete }) => {
  const activeVerses = verses.filter(
    v => v.verse_number >= settings.startAyah && v.verse_number <= settings.endAyah
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAyahRepeats, setCurrentAyahRepeats] = useState(settings.ayahRepetitions);
  const [isWaiting, setIsWaiting] = useState(false);
  
  const [selectedAyahId, setSelectedAyahId] = useState<number | null>(null);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    stopAudio();
    setCurrentIndex(0);
    setCurrentAyahRepeats(settings.ayahRepetitions);
  }, [settings.startAyah, settings.endAyah, settings.reciterId, verses]);

  const stopAudio = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsWaiting(false);
  };

  const playVerse = (index: number) => {
    if (activeVerses.length === 0) return;
    const verse = activeVerses[index];
    if (!verse?.audio_url) return;

    if (audioRef.current) {
        audioRef.current.pause();
    }
    
    audioRef.current = new Audio(verse.audio_url);
    audioRef.current.onended = handleAudioEnded;
    audioRef.current.play().catch(e => console.error("Play failed", e));
    setIsPlaying(true);
  };

  const handleAudioEnded = () => {
    if (currentAyahRepeats > 1) {
        setIsWaiting(true);
        setTimeout(() => {
            setCurrentAyahRepeats(p => p - 1);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
            setIsWaiting(false);
        }, settings.delayBetweenAyahs * 1000);
    } else if (currentIndex < activeVerses.length - 1) {
        setIsWaiting(true);
        setTimeout(() => {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setCurrentAyahRepeats(settings.ayahRepetitions);
            playVerse(nextIdx);
            setIsWaiting(false);
        }, settings.delayBetweenAyahs * 1000);
    } else {
        setIsPlaying(false);
        if (onComplete) onComplete();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current || audioRef.current.ended) {
          playVerse(currentIndex);
      } else {
          audioRef.current.play();
          setIsPlaying(true);
      }
    }
  };

  const handleVerseClick = (index: number) => {
    setCurrentIndex(index);
    setCurrentAyahRepeats(settings.ayahRepetitions);
    playVerse(index);
  };

  const handleFetchTafsir = async (ayah: Ayah, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAyahId === ayah.id) {
        setSelectedAyahId(null);
        return;
    }
    setSelectedAyahId(ayah.id);
    setLoadingTafsir(true);
    setTafsir(null);
    const text = await getTafsir(ayah, surahName);
    setTafsir(text);
    setLoadingTafsir(false);
  };

  if (activeVerses.length === 0) return <div className="text-center p-8 text-slate-500">الرجاء تحديد نطاق صحيح للآيات.</div>;

  const currentAyahObj = activeVerses[currentIndex];
  const reciterName = RECITERS.find(r => r.id === settings.reciterId)?.name || 'القارئ';

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
                 <h2 className="text-3xl font-bold font-amiri mb-1">سورة {surahName}</h2>
                 <p className="text-emerald-300 text-sm">{reciterName}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-emerald-100 text-sm">
                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">الآية: {currentAyahObj?.verse_number}</div>
                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">تكرار المتبقي: {currentAyahRepeats} / {settings.ayahRepetitions}</div>
            </div>
            <div className="flex items-center gap-8">
                <button onClick={() => handleVerseClick(Math.max(0, currentIndex - 1))} className="p-3"><SkipForward className="w-8 h-8 rotate-180" /></button>
                <button onClick={togglePlay} className="w-20 h-20 bg-white text-emerald-900 rounded-full flex items-center justify-center shadow-2xl">
                  {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                </button>
                <button onClick={() => handleVerseClick(Math.min(activeVerses.length - 1, currentIndex + 1))} className="p-3"><SkipBack className="w-8 h-8 rotate-180" /></button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {activeVerses.map((ayah, idx) => {
          const isActive = idx === currentIndex;
          const isMemorized = memorizedKeys[ayah.verse_key];
          return (
            <div 
              key={ayah.id} 
              onClick={() => handleVerseClick(idx)}
              className={`p-6 transition-all border-l-4 cursor-pointer group ${isActive ? 'bg-emerald-50 border-emerald-500' : 'border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-center mb-4">
                 <span className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{ayah.verse_number}</span>
                 <div className="flex gap-2">
                     <button
                        onClick={(e) => { e.stopPropagation(); onToggleMemorized(ayah.verse_key); }}
                        className={`px-3 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 ${isMemorized ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-400 border-slate-200'}`}
                     >
                        <Check className="w-4 h-4" /> {isMemorized ? "حفظت" : "حفظ؟"}
                     </button>
                    <button onClick={(e) => handleFetchTafsir(ayah, e)} className="p-2 rounded-full border border-slate-200"><BookOpen className="w-5 h-5" /></button>
                 </div>
              </div>
              <p className={`quran-text text-right text-4xl leading-relaxed ${isActive ? 'text-emerald-950' : 'text-slate-700'}`}>{ayah.text_uthmani}</p>
              {selectedAyahId === ayah.id && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-emerald-100 animate-in fade-in" onClick={e => e.stopPropagation()}>
                    <p className="text-slate-800 text-justify">{loadingTafsir ? "جاري التحميل..." : tafsir}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
