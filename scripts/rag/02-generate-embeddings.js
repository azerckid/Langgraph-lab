#!/usr/bin/env node
/**
 * RAG Embedding Generation Script (Fixed)
 * 
 * 이 스크립트는 Turso에 저장된 문서 청크를:
 * 1. Gemini text-embedding-004로 벡터화 (768차원)
 * 2. embeddings 테이블에 저장
 */

import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Turso 클라이언트 초기화
const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

// Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 콘텐츠 유효성 검사 및 정제
 */
function sanitizeContent(content) {
    if (!content || typeof content !== 'string') {
        return null;
    }

    const trimmed = content.trim();

    // 너무 짧은 내용 제외
    if (trimmed.length < 20) {
        return null;
    }

    // 특수 문자만 있는 경우 제외
    const alphanumericCount = (trimmed.match(/[a-zA-Z0-9가-힣]/g) || []).length;
    if (alphanumericCount < 10) {
        return null;
    }

    return trimmed;
}

/**
 * 문서 청크를 벡터로 변환
 */
async function embedDocument(content) {
    const sanitized = sanitizeContent(content);

    if (!sanitized) {
        throw new Error('Invalid content after sanitization');
    }

    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    try {
        // 올바른 형식: 문자열만 전달
        const result = await model.embedContent(sanitized);
        return result.embedding.values;
    } catch (error) {
        throw new Error(`Gemini API error: ${error.message}`);
    }
}

/**
 * 벡터를 BLOB으로 변환 (Float32Array)
 */
function vectorToBlob(vector) {
    const float32Array = new Float32Array(vector);
    return Buffer.from(float32Array.buffer);
}

/**
 * 임베딩을 데이터베이스에 저장
 */
async function saveEmbedding(documentId, embedding) {
    const blob = vectorToBlob(embedding);

    await turso.execute({
        sql: 'INSERT INTO embeddings (document_id, embedding) VALUES (?, ?)',
        args: [documentId, blob]
    });
}

/**
 * 메인 실행 함수
 */
async function main() {
    console.log('🚀 Starting embedding generation (fixed)...\n');

    // 1. 임베딩되지 않은 문서 가져오기
    const result = await turso.execute(`
    SELECT d.id, d.content, d.file_path, d.project_id
    FROM documents d
    LEFT JOIN embeddings e ON d.id = e.document_id
    WHERE e.id IS NULL
    ORDER BY d.id
  `);

    const documents = result.rows;
    console.log(`Found ${documents.length} documents to embed\n`);

    if (documents.length === 0) {
        console.log('✅ All documents already embedded!');
        return;
    }

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    // 2. 각 문서 임베딩 생성
    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        try {
            // Gemini로 임베딩 생성
            const embedding = await embedDocument(doc.content);

            // Turso에 저장
            await saveEmbedding(doc.id, embedding);

            processed++;

            // 진행 상황 표시
            if (processed % 10 === 0) {
                console.log(`   ✓ Processed ${processed}/${documents.length} (${skipped} skipped, ${errors} errors)`);
            }

            // Rate limiting: Gemini 무료 티어 (15 RPM)
            await new Promise(resolve => setTimeout(resolve, 4100)); // ~14 RPM

        } catch (error) {
            if (error.message.includes('Invalid content')) {
                // 유효하지 않은 콘텐츠는 건너뛰기
                skipped++;
            } else {
                // 기타 오류
                errors++;
                if (errors <= 5) {
                    console.error(`   ⚠️  Error on doc ${doc.id}: ${error.message.substring(0, 80)}`);
                }
            }
        }
    }

    console.log('\n✨ Embedding generation complete!');
    console.log(`   Processed: ${processed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Success rate: ${((processed / documents.length) * 100).toFixed(1)}%`);
}

// 실행
main().catch(console.error);
