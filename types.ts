
export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

export interface Ayah {
  id: number;
  verse_key: string; // e.g., "1:1"
  text_uthmani: string;
  verse_number: number; // In surah
  audio_url?: string;
}

export interface Reciter {
  id: number;
  name: string;
}

export interface PlayerSettings {
  surahId: number;
  startAyah: number;
  endAyah: number;
  ayahRepetitions: number;
  reciterId: number;
  delayBetweenAyahs: number; // in seconds
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  ayahsMemorized: number;
  target: number;
  streak: number;
  lastPractice: string;
}

export enum QuizLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum QuizScope {
  WARD = 'WARD',
  SURAH = 'SURAH',
  ALL_MEMORIZED = 'ALL_MEMORIZED'
}

export enum QuizType {
  MCQ = 'MCQ',
  REORDER = 'REORDER'
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  READING = 'READING',
  MEMORIZING = 'MEMORIZING',
  QUIZ = 'QUIZ',
}
