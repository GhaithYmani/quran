import React from 'react';
import { DailyStats } from '../types';
import { Trophy, Target, Calendar, Bell, Flame, ChevronRight } from 'lucide-react';

interface DashboardProps {
  stats: DailyStats;
  onRequestNotification: () => void;
  onStartMemorizing: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onRequestNotification, onStartMemorizing }) => {
  const progressPercentage = Math.min(100, (stats.ayahsMemorized / stats.target) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold font-amiri mb-2">أهلاً بك يا حافظ القرآن</h2>
          <p className="text-emerald-100 opacity-90">خيركم من تعلم القرآن وعلمه. استمر في وردك اليومي.</p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 text-center min-w-[120px]">
           <div className="flex items-center justify-center gap-2 text-yellow-300 font-bold text-xl mb-1">
             <Flame className="w-6 h-6 fill-current" />
             <span>{stats.streak}</span>
           </div>
           <span className="text-xs text-emerald-100">أيام متتالية</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goal Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700">
                    <Target className="w-6 h-6 text-blue-500" />
                    <h3 className="font-bold text-lg">هدف اليوم</h3>
                </div>
                <span className="text-sm text-slate-500 font-medium">
                    {stats.ayahsMemorized} من {stats.target} آيات
                </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                <div 
                    className="h-full bg-blue-500 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>

            {stats.ayahsMemorized >= stats.target ? (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-bold">
                    <Trophy className="w-5 h-5" />
                    أحسنت! لقد أتممت هدفك اليومي
                </div>
            ) : (
                <button 
                    onClick={onStartMemorizing}
                    className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                    ابدأ الحفظ الآن
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* Notifications & Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
             <div className="flex items-center gap-2 text-slate-700 mb-4">
                <Bell className="w-6 h-6 text-purple-500" />
                <h3 className="font-bold text-lg">التنبيهات</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                فعّل التنبيهات لنقوم بتذكيرك بموعد الورد اليومي والاختبارات الدورية للحفاظ على قوة حفظك.
            </p>
            <button 
                onClick={onRequestNotification}
                className="w-full py-3 border border-purple-200 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
                <Bell className="w-4 h-4" />
                تفعيل التنبيهات اليومية
            </button>
        </div>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
             <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5" />
             </div>
             <div className="text-xs text-slate-500 mb-1">آخر مراجعة</div>
             <div className="font-bold text-slate-800 text-sm">{stats.lastPractice}</div>
          </div>
           {/* More stats placeholders could go here */}
      </div>

    </div>
  );
};