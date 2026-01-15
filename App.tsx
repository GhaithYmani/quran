
import React, { useState, useEffect } from 'react';
import { fetchSurahs, fetchVersesWithAudio } from './services/quranService';
import { Surah, Ayah, PlayerSettings, AppMode, DailyStats } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { Player } from './components/Player';
import { Quiz } from './components/Quiz';
import { Dashboard } from './components/Dashboard';
import { Book, LayoutGrid, Award, Menu, X, Home } from 'lucide-react';

export default function App() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [memorizedKeys, setMemorizedKeys] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('memorized_verses');
    return saved ? JSON.parse(saved) : {};
  });

  const [settings, setSettings] = useState<PlayerSettings>({
    surahId: 1,
    startAyah: 1,
    endAyah: 7,
    ayahRepetitions: 3,
    reciterId: 7, 
    delayBetweenAyahs: 1
  });

  const [dailyStats, setDailyStats] = useState<DailyStats>(() => {
    const saved = localStorage.getItem('quran_daily_stats');
    const today = new Date().toISOString().split('T')[0];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed;
      return {
        date: today,
        ayahsMemorized: 0,
        target: 3,
        streak: parsed.streak || 0,
        lastPractice: parsed.date
      };
    }
    return { date: today, ayahsMemorized: 0, target: 3, streak: 0, lastPractice: '---' };
  });

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  useEffect(() => {
    localStorage.setItem('quran_daily_stats', JSON.stringify(dailyStats));
  }, [dailyStats]);

  useEffect(() => {
    localStorage.setItem('memorized_verses', JSON.stringify(memorizedKeys));
  }, [memorizedKeys]);

  useEffect(() => {
    if (selectedSurah) {
      setLoadingVerses(true);
      fetchVersesWithAudio(selectedSurah, settings.reciterId).then(data => {
        setVerses(data);
        if (settings.surahId !== selectedSurah) {
            setSettings(prev => ({
                ...prev,
                surahId: selectedSurah,
                startAyah: 1,
                endAyah: Math.min(data.length, 5)
            }));
        }
        setLoadingVerses(false);
      });
    }
  }, [selectedSurah, settings.reciterId]);

  const handleSurahSelect = (id: number) => {
    setSelectedSurah(id);
    setMode(AppMode.MEMORIZING);
    setSidebarOpen(false);
  };

  const getSurahName = () => surahs.find(s => s.id === selectedSurah)?.name_arabic || '';

  const handleToggleMemorized = (verseKey: string) => {
    setMemorizedKeys(prev => {
        const isCurrentlyMemorized = !!prev[verseKey];
        const newState = { ...prev, [verseKey]: !isCurrentlyMemorized };
        if (!isCurrentlyMemorized) {
            setDailyStats(curr => ({ ...curr, ayahsMemorized: curr.ayahsMemorized + 1 }));
        }
        return newState;
    });
  };

  const activeVersesForQuiz = verses.filter(
    v => v.verse_number >= settings.startAyah && v.verse_number <= settings.endAyah
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="font-bold text-xl text-emerald-800 flex items-center gap-2"><Book className="w-6 h-6" /> المحفظ</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">{isSidebarOpen ? <X /> : <Menu />}</button>
      </div>

      <aside className={`fixed inset-y-0 right-0 z-40 w-80 bg-white border-l transform transition-transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b">
           <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center"><Book className="w-6 h-6" /></div>
                <div><h1 className="font-bold text-xl">المحفظ</h1><p className="text-xs text-slate-500">رفيقك لحفظ القرآن</p></div>
           </div>
           <button onClick={() => { setMode(AppMode.DASHBOARD); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl ${mode === AppMode.DASHBOARD ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50'}`}><Home className="w-5 h-5" /> الرئيسية والإنجاز</button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-160px)] p-2 space-y-1">
            {surahs.map(surah => (
                <button key={surah.id} onClick={() => handleSurahSelect(surah.id)} className={`w-full flex items-center justify-between p-3 rounded-xl ${selectedSurah === surah.id && mode !== AppMode.DASHBOARD ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-6 h-6 flex items-center justify-center rounded-full border">{surah.id}</span>
                        <span className="font-amiri font-bold text-lg">{surah.name_arabic}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md">{surah.verses_count}</span>
                </button>
            ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            {mode === AppMode.DASHBOARD ? (
                <Dashboard stats={dailyStats} onRequestNotification={() => {}} onStartMemorizing={() => selectedSurah ? setMode(AppMode.MEMORIZING) : handleSurahSelect(1)} />
            ) : (
                <>
                     <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold font-amiri text-emerald-900">سورة {getSurahName()}</h2>
                            <p className="text-slate-500 text-sm">حدد النطاق وابدأ التكرار</p>
                        </div>
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border">
                            <button onClick={() => setMode(AppMode.MEMORIZING)} className={`px-5 py-2 rounded-lg font-bold text-sm ${mode === AppMode.MEMORIZING ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4 mr-2 inline" /> التكرار</button>
                            <button onClick={() => setMode(AppMode.QUIZ)} className={`px-5 py-2 rounded-lg font-bold text-sm ${mode === AppMode.QUIZ ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}><Award className="w-4 h-4 mr-2 inline" /> مراجعة الورد</button>
                        </div>
                     </div>

                    {loadingVerses ? (
                        <div className="flex flex-col items-center justify-center h-64"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div>
                    ) : (
                        mode === AppMode.MEMORIZING ? (
                            <div className="space-y-6">
                                <SettingsPanel settings={settings} maxAyahs={verses.length} onUpdate={setSettings} />
                                <Player verses={verses} settings={settings} surahName={getSurahName()} memorizedKeys={memorizedKeys} onToggleMemorized={handleToggleMemorized} />
                            </div>
                        ) : (
                            <Quiz wardVerses={activeVersesForQuiz} allVerses={verses} surahName={getSurahName()} memorizedKeys={memorizedKeys} />
                        )
                    )}
                </>
            )}
        </div>
      </main>
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/20 z-30 md:hidden backdrop-blur-sm"></div>}
    </div>
  );
}
