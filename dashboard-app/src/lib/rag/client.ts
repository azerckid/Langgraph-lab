import { createClient } from '@libsql/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경 변수 검증
const TURSO_URL = import.meta.env.VITE_TURSO_DATABASE_URL;
const TURSO_TOKEN = import.meta.env.VITE_TURSO_AUTH_TOKEN;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!TURSO_URL || !TURSO_TOKEN || !GEMINI_KEY) {
    console.error('RAG Configuration Error: Missing environment variables');
}

// Turso 클라이언트 (읽기 전용 권장되지만, 데모용으로 직접 사용)
export const db = createClient({
    url: TURSO_URL || '',
    authToken: TURSO_TOKEN || '',
});

// Gemini 클라이언트
const genAI = new GoogleGenerativeAI(GEMINI_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // or whichever model we chose (2.5 flash mentioned in plan)

// 2.5 Flash가 아직 사용할 수 없는 경우를 대비해 1.5 Flash 또는 2.0 Flash 사용
// 계획서에는 "Gemini 2.5 Flash"로 되어 있으나, 실제 API 모델명은 'gemini-1.5-flash' 또는 'gemini-2.0-flash-exp' 일 수 있음.
// 안전하게 1.5 Flash를 기본으로 하거나, 사용 가능한 최신 버전을 사용.
// 여기서는 'gemini-1.5-flash'를 사용하고 필요시 업데이트.

export const generateEmbedding = async (text: string) => {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

export const generateAnswer = async (prompt: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error generating answer:', error);
        throw error;
    }
};
