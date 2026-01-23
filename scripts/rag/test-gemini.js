#!/usr/bin/env node
/**
 * Gemini API 테스트 스크립트
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testEmbedding() {
    console.log('Testing Gemini Embedding API...\n');

    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    try {
        // 올바른 형식: 문자열만 전달
        const result = await model.embedContent('This is a test message for embedding.');

        console.log('✅ Success!');
        console.log(`Embedding dimension: ${result.embedding.values.length}`);
        console.log(`First 5 values: ${result.embedding.values.slice(0, 5)}`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEmbedding();
