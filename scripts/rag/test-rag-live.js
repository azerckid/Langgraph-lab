
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: 'dashboard-app/.env.local' });

const TURSO_URL = process.env.VITE_TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.VITE_TURSO_AUTH_TOKEN;
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

console.log('--- Config Check ---');
console.log('URL:', TURSO_URL ? 'OK' : 'MISSING');
console.log('TOKEN:', TURSO_TOKEN ? 'OK' : 'MISSING');
console.log('KEY:', GEMINI_KEY ? 'OK' : 'MISSING');

const db = createClient({
    url: TURSO_URL || '',
    authToken: TURSO_TOKEN || '',
});

const genAI = new GoogleGenerativeAI(GEMINI_KEY || '');

async function test() {
    try {
        const query = "news reader 에 대해 설명해줘";
        console.log('\n1. Generating Embedding for:', query);

        const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const embedResult = await embedModel.embedContent(query);
        const embedding = embedResult.embedding.values;
        console.log('✓ Embedding generated (Length: ' + embedding.length + ')');

        console.log('\n2. Searching Turso DB...');
        // Node environment uses Buffer
        const vectorQuery = Buffer.from(new Float32Array(embedding).buffer);

        const sql = `
            SELECT d.id, d.content, d.file_path, d.project_id,
                   vector_distance_cos(e.embedding, vector(?)) as distance
            FROM embeddings e
            JOIN documents d ON e.document_id = d.id
            ORDER BY distance ASC
            LIMIT 3
        `;

        const results = await db.execute({
            sql: sql,
            args: [vectorQuery]
        });

        console.log('✓ DB Search successful. Found:', results.rows.length, 'results');
        results.rows.forEach((row, i) => {
            console.log(`   [${i + 1}] ${row.project_id}/${row.file_path} (Dist: ${row.distance.toFixed(4)})`);
        });

        if (results.rows.length > 0) {
            console.log('\n3. Generating AI Answer...');
            const context = results.rows.map(r => r.content).join('\n\n---\n\n');
            const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer in Korean:`;
            const answer = await chatModel.generateContent(prompt);
            console.log('\n--- AI RESPONSE ---');
            console.log(answer.response.text());
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error(error);
    }
}

test();
