
import { Surah, Ayah, Reciter } from '../types';

const BASE_URL = 'https://api.quran.com/api/v4';

export const RECITERS: Reciter[] = [
  { id: 7, name: 'مشاري العفاسي' },
  { id: 4, name: 'أبو بكر الشاطري' },
  { id: 2, name: 'عبد الباسط عبد الصمد (مرتل)' }
];

export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/chapters?language=ar`);
    if (!response.ok) throw new Error('Failed to fetch surahs');
    const data = await response.json();
    return data.chapters;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
};

export const fetchVerseByKey = async (verseKey: string): Promise<Ayah | null> => {
  try {
    const response = await fetch(`${BASE_URL}/quran/verses/uthmani?verse_key=${verseKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    const verse = data.verses[0];
    return {
      id: verse.id,
      verse_key: verse.verse_key,
      text_uthmani: verse.text_uthmani,
      verse_number: parseInt(verse.verse_key.split(':')[1])
    };
  } catch (e) {
    return null;
  }
};

export const fetchVersesWithAudio = async (surahId: number, reciterId: number): Promise<Ayah[]> => {
  try {
    // Fetch all verses for the surah to avoid pagination issues
    const textResponse = await fetch(`${BASE_URL}/quran/verses/uthmani?chapter_number=${surahId}`);
    if (!textResponse.ok) throw new Error('Failed to fetch text');
    const textData = await textResponse.json();
    
    const audioResponse = await fetch(`${BASE_URL}/recitations/${reciterId}/by_chapter/${surahId}`);
    
    let audioFiles: any[] = [];
    if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        if (audioData && Array.isArray(audioData.audio_files)) {
            audioFiles = audioData.audio_files;
        }
    }

    const verses: Ayah[] = textData.verses.map((verse: any) => {
      const audioFile = audioFiles.find((a: any) => a.verse_key === verse.verse_key);
      return {
        id: verse.id,
        verse_key: verse.verse_key,
        text_uthmani: verse.text_uthmani,
        verse_number: parseInt(verse.verse_key.split(':')[1]),
        audio_url: audioFile ? `https://verses.quran.com/${audioFile.url}` : undefined
      };
    });

    return verses;
  } catch (error) {
    console.error('Error fetching verses:', error);
    return [];
  }
};
