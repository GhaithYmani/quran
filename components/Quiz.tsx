
import React, { useState, useEffect } from 'react';
import { Ayah, QuizLevel, QuizScope, QuizType } from '../types';
import { generateQuizQuestion } from '../services/geminiService';
import { fetchVerseByKey } from '../services/quranService';
import { BrainCircuit, HelpCircle, Settings, ArrowRight, CheckCircle, ListFilter, Check, X, Info, LayoutGrid, RotateCcw } from 'lucide-react';

interface QuizProps {
  wardVerses: Ayah[];
  allVerses: Ayah[];
  surahName: string;
  memorizedKeys: Record<string, boolean>;
}

export const Quiz: React.FC<QuizProps> = ({ wardVerses, allVerses, surahName, memorizedKeys }) => {
  const [step, setStep] = useState<'config' | 'question'>('config');
  const [level, setLevel] = useState<QuizLevel>(QuizLevel.EASY);
  const [scope, setScope] = useState<QuizScope>(QuizScope.WARD);
  const [type, setType] = useState<QuizType>(QuizType.MCQ);
  
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // For REORDER type
  const [reorderList, setReorderList] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[\u064B-\u0652]/g, "") 
      .replace(/[إأآا]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ـ/g, "")
      .replace(/[^\u0621-\u064A\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const startQuiz = async () => {
    setLoading(true);
    setQuestionData(null);
    setIsCorrect(null);
    setSelectedOption(null);
    setShowExplanation(false);
    setReorderList([]);
    
    let targetVerses: Ayah[] = [];
    let scopeLabel = "";

    if (scope === QuizScope.WARD) {
      targetVerses = wardVerses;
      scopeLabel = `وردك اليومي من ${surahName}`;
    } else if (scope === QuizScope.SURAH) {
      targetVerses = allVerses;
      scopeLabel = `سورة ${surahName}`;
    } else {
      const keys = Object.keys(memorizedKeys).filter(k => memorizedKeys[k]);
      if (keys.length === 0) {
          alert("لا توجد آيات محفوظة بعد في سجلك.");
          setLoading(false);
          return;
      }
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const v = await fetchVerseByKey(randomKey);
      if (v) targetVerses = [v];
      scopeLabel = "جميع ما حفظته سابقاً";
    }

    if (targetVerses.length === 0) {
      alert("لم يتم العثور على آيات في هذا النطاق.");
      setLoading(false);
      return;
    }

    try {
      const q = await generateQuizQuestion(scopeLabel, targetVerses, level, type);
      setQuestionData(q);
      if (q.type === 'REORDER') {
          setShuffledWords(q.words || []);
      }
      setStep('question');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMcqSubmit = (option: string) => {
    if (isCorrect !== null) return;
    setSelectedOption(option);
    const correct = normalizeArabic(option) === normalizeArabic(questionData.answer);
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  const handleReorderWordClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    setReorderList([...reorderList, word]);
    setShuffledWords(shuffledWords.filter((_, i) => i !== index));
  };

  const undoReorder = () => {
    if (isCorrect !== null || reorderList.length === 0) return;
    const lastWord = reorderList[reorderList.length - 1];
    setReorderList(reorderList.slice(0, -1));
    setShuffledWords([...shuffledWords, lastWord]);
  };

  const checkReorder = () => {
    const final = reorderList.join(' ');
    const correct = normalizeArabic(final) === normalizeArabic(questionData.answer);
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  if (step === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 py-4">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BrainCircuit className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">مراجعة الحفظ</h2>
            <p className="text-slate-500 mt-2">اختر الأسلوب الذي تفضله لتقوية حفظك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-600" /> مستوى الصعوبة
                </label>
                <div className="flex flex-col gap-2">
                    {[
                        { id: QuizLevel.EASY, label: 'سهل' },
                        { id: QuizLevel.MEDIUM, label: 'متوسط' },
                        { id: QuizLevel.HARD, label: 'صعب' }
                    ].map(l => (
                        <button key={l.id} onClick={() => setLevel(l.id)} className={`p-3 rounded-xl border-2 transition-all font-bold text-right ${level === l.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>{l.label}</button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-blue-600" /> نوع المراجعة
                </label>
                <div className="flex flex-col gap-2">
                    <button onClick={() => setType(QuizType.MCQ)} className={`p-3 rounded-xl border-2 transition-all font-bold text-right flex items-center gap-3 ${type === QuizType.MCQ ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-100 text-slate-500'}`}><ListFilter className="w-4 h-4" /> اختيار من متعدد</button>
                    <button onClick={() => setType(QuizType.REORDER)} className={`p-3 rounded-xl border-2 transition-all font-bold text-right flex items-center gap-3 ${type === QuizType.REORDER ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-100 text-slate-500'}`}><LayoutGrid className="w-4 h-4" /> ترتيب الكلمات (حديث)</button>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" /> النطاق
            </label>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: QuizScope.WARD, label: 'الورد' },
                    { id: QuizScope.SURAH, label: 'السورة' },
                    { id: QuizScope.ALL_MEMORIZED, label: 'السجل' }
                ].map(s => (
                    <button key={s.id} onClick={() => setScope(s.id)} className={`p-3 rounded-xl border-2 text-center transition-all font-bold text-xs ${scope === s.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500'}`}>{s.label}</button>
                ))}
            </div>
        </div>

        <button onClick={startQuiz} disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">{loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'بدء المراجعة'}</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[550px]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="font-bold">مراجعة المحفظ</span>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{type === QuizType.MCQ ? 'اختيارات' : 'ترتيب كلمات'}</div>
            </div>
            
            <div className="p-8 md:p-12 flex-1 flex flex-col">
                <div className="mb-10 text-center">
                    <p className="quran-text text-3xl md:text-4xl text-slate-800 leading-relaxed">{questionData?.question}</p>
                </div>

                {/* MCQ UI */}
                {questionData?.type === 'MCQ' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {questionData.options.map((option: string, i: number) => {
                            const isSelected = selectedOption === option;
                            const isCorrectOption = normalizeArabic(option) === normalizeArabic(questionData.answer);
                            let btnClass = "border-slate-100 hover:border-emerald-200 hover:bg-emerald-50";
                            
                            if (isCorrect !== null) {
                                if (isCorrectOption) btnClass = "bg-emerald-100 border-emerald-500 text-emerald-700";
                                else if (isSelected && !isCorrect) btnClass = "bg-rose-50 border-rose-500 text-rose-700";
                                else btnClass = "opacity-40 border-slate-100";
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleMcqSubmit(option)}
                                    disabled={isCorrect !== null}
                                    className={`p-6 rounded-2xl border-2 text-right transition-all font-bold quran-text text-xl ${btnClass}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* REORDER UI */}
                {questionData?.type === 'REORDER' && (
                    <div className="space-y-10 mb-8">
                        <div className="min-h-[140px] p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-wrap gap-4 justify-center items-center content-center transition-all relative">
                             {reorderList.length === 0 && <span className="text-slate-400 font-medium">اختر الكلمات بالترتيب الصحيح لتكوين الآية...</span>}
                             {reorderList.map((word, i) => (
                                 <span key={i} className="px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-md quran-text text-2xl animate-in zoom-in-50">{word}</span>
                             ))}
                             {reorderList.length > 0 && isCorrect === null && (
                                <button onClick={undoReorder} className="absolute bottom-2 left-2 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-rose-500 transition-colors">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                             )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 justify-center">
                            {shuffledWords.map((word, i) => (
                                <button key={i} onClick={() => handleReorderWordClick(word, i)} disabled={isCorrect !== null} className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all quran-text text-2xl font-bold shadow-md active:scale-95">{word}</button>
                            ))}
                        </div>

                        {isCorrect === null && (
                            <div className="flex justify-center">
                                <button onClick={checkReorder} disabled={shuffledWords.length > 0} className="w-full max-w-sm py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl disabled:opacity-30">تحقق من الترتيب</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Feedback */}
                {isCorrect !== null && (
                    <div className="animate-in slide-in-from-top-4">
                        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 mb-6 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            {isCorrect ? <CheckCircle className="w-10 h-10 text-emerald-600" /> : <X className="w-10 h-10 text-rose-600" />}
                            <div>
                                <h5 className={`font-bold text-lg ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>{isCorrect ? 'أحسنت! إجابة صحيحة' : 'تحتاج للمراجعة'}</h5>
                                <p className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{isCorrect ? 'ما شاء الله، حفظك متين.' : 'راجع الآية من المصحف جيدا.'}</p>
                            </div>
                        </div>
                        
                        {!isCorrect && questionData.answer && (
                            <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-400 block mb-2">النص الصحيح:</span>
                                <p className="quran-text text-3xl text-emerald-950 leading-relaxed text-center">{questionData.answer}</p>
                            </div>
                        )}

                        {questionData.explanation && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-800 text-center italic">
                                <Info className="w-4 h-4 inline-block ml-2 align-text-top" />
                                "{questionData.explanation}"
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep('config')} className="py-4 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all">الإعدادات</button>
                            <button onClick={startQuiz} disabled={loading} className="py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl">{loading ? 'تحميل...' : 'سؤال جديد'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
