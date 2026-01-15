
import { GoogleGenAI, Type } from "@google/genai";
import { Ayah, QuizLevel, QuizType } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getTafsir = async (ayah: Ayah, surahName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "عذراً، خدمة الذكاء الاصطناعي غير متوفرة حالياً.";

  try {
    const prompt = `أريد تفسير الآية رقم ${ayah.verse_number} من سورة ${surahName}. النص: "${ayah.text_uthmani}".
    الشروط: تفسير مختصر وواضح من ابن كثير أو الطبري مباشرة.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: "أنت مفسر قرآني دقيق." }
    });

    return response.text || "لم يتم العثور على تفسير.";
  } catch (error) {
    return "حدث خطأ أثناء جلب التفسير.";
  }
};

export const generateQuizQuestion = async (
  scopeName: string, 
  verses: Ayah[], 
  level: QuizLevel,
  quizType: QuizType
): Promise<any> => {
  const ai = getAiClient();
  if (!ai || !verses.length) throw new Error("Input missing");

  const randomIdx = Math.floor(Math.random() * verses.length);
  const targetAyah = verses[randomIdx];

  let taskDescription = "";
  if (quizType === QuizType.MCQ) {
    taskDescription = "أنشئ سؤال اختيار من متعدد (4 خيارات). لا تضع شروحات داخل الخيارات أبداً، فقط نص الآية أو الكلمة.";
  } else if (quizType === QuizType.REORDER) {
    taskDescription = "أنشئ سؤال 'ترتيب الكلمات'. قم بتقسيم الآية إلى كلمات وبعثرتها.";
  }

  const prompt = `أنت خبير في علوم القرآن.
  المطلوب: ${taskDescription}
  المستوى: ${level}
  الآية المصدر: "${targetAyah.text_uthmani}" (سورة ${scopeName}, آية ${targetAyah.verse_number}).
  
  يجب أن يكون الرد JSON بالهيكل التالي:
  للاختيار من متعدد: { "type": "MCQ", "question": "...", "options": ["...", "...", "...", "..."], "answer": "نص الخيار الصحيح", "explanation": "توضيح بسيط يظهر للمستخدم بعد اختيار الإجابة" }
  للترتيب: { "type": "REORDER", "question": "رتب كلمات الآية التالية لتكتمل الآية:", "words": ["كلمة3", "كلمة1", "كلمة2"], "answer": "كلمة1 كلمة2 كلمة3", "explanation": "توضيح بسيط عن الآية" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["type", "question", "answer"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    // Fallback for connectivity issues
    return {
        type: "MCQ",
        question: "ما هي الآية التالية لقوله تعالى: " + targetAyah.text_uthmani.substring(0, 30) + "...",
        options: [targetAyah.text_uthmani, "خيار خاطئ 1", "خيار خاطئ 2", "خيار خاطئ 3"],
        answer: targetAyah.text_uthmani,
        explanation: "راجع سورة " + scopeName
    };
  }
};
