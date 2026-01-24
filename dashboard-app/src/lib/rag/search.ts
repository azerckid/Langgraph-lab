import { db, generateEmbedding, generateAnswer, generateAnswerStream } from './client';

export interface SearchResult {
    id: number;
    content: string;
    distance: number;
    metadata: {
        filePath: string;
        projectId: string;
    };
}

export interface RAGResponse {
    answer: string;
    sources: SearchResult[];
    query: string;
}

/**
 * 사용자 질문에 대한 답변 생성 (RAG)
 */
export async function searchAndAnswer(query: string): Promise<RAGResponse> {
    // 1. 질문 임베딩 생성
    const embedding = await generateEmbedding(query);

    // 2. Turso 벡터 검색
    const vectorQuery = new Float32Array(embedding).buffer;

    const sql = `
    SELECT d.id, d.content, d.file_path, d.project_id,
           vector_distance_cos(e.embedding, vector(?)) as distance
    FROM embeddings e
    JOIN documents d ON e.document_id = d.id
    ORDER BY distance ASC
    LIMIT 5
  `;

    const results = await db.execute({
        sql: sql,
        args: [vectorQuery]
    });

    const sources: SearchResult[] = results.rows.map((row: any) => ({
        id: row.id,
        content: row.content,
        distance: row.distance,
        metadata: {
            filePath: row.file_path,
            projectId: row.project_id
        }
    }));

    // 3. 컨텍스트 구성
    const context = sources.map(s =>
        `[File: ${s.metadata.projectId}/${s.metadata.filePath}]\n${s.content}`
    ).join('\n\n---\n\n');

    // 4. LLM 답변 생성
    const prompt = `
You are an AI Assistant for the "AI Agent Lab" project. 
Answer the user's question based ONLY on the following context.
If the answer cannot be found in the context, say so politely.

Context:
${context}

User Question: ${query}

Answer (in Korean, formatted in Markdown):
  `;

    const answer = await generateAnswer(prompt);

    return {
        answer,
        sources,
        query
    };
}

/**
 * 사용자 질문에 대한 답변 생성 (Streaming RAG)
 */
export async function searchAndAnswerStream(
    query: string,
    onChunk: (chunk: string) => void
): Promise<{ sources: SearchResult[] }> {
    // 1. 질문 임베딩 생성
    const embedding = await generateEmbedding(query);

    // 2. Turso 벡터 검색
    const vectorQuery = new Float32Array(embedding).buffer;

    const sql = `
    SELECT d.id, d.content, d.file_path, d.project_id,
           vector_distance_cos(e.embedding, vector(?)) as distance
    FROM embeddings e
    JOIN documents d ON e.document_id = d.id
    ORDER BY distance ASC
    LIMIT 5
  `;

    const results = await db.execute({
        sql: sql,
        args: [vectorQuery]
    });

    const sources: SearchResult[] = results.rows.map((row: any) => ({
        id: row.id,
        content: row.content,
        distance: row.distance,
        metadata: {
            filePath: row.file_path,
            projectId: row.project_id
        }
    }));

    // 3. 컨텍스트 구성
    const context = sources.map(s =>
        `[File: ${s.metadata.projectId}/${s.metadata.filePath}]\n${s.content}`
    ).join('\n\n---\n\n');

    // 4. LLM 답변 생성 (Stream)
    const prompt = `
You are an AI Assistant for the "AI Agent Lab" project. 
Answer the user's question based ONLY on the following context.
If the answer cannot be found in the context, say so politely.

Context:
${context}

User Question: ${query}

Answer (in Korean, formatted in Markdown):
  `;

    const stream = await generateAnswerStream(prompt);

    for await (const chunk of stream) {
        const chunkText = chunk.text();
        onChunk(chunkText);
    }

    return { sources };
}
