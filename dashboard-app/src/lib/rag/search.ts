import { db, generateEmbedding, generateAnswer } from './client';

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
    // vector_top_k 사용 (vector extension 필요)
    // 768차원 벡터
    const vectorQuery = new Float32Array(embedding).buffer;

    // Turso(libSQL) vector search query
    // 정확한 구문은 extension 버전에 따라 다를 수 있으나, 일반적으로 vector_top_k 인덱스 활용
    // 여기서는 근사값 검색을 위해 코사인 유사도(또는 거리)를 계산하거나 vector_top_k 함수 사용
    // 간단한 구현을 위해 vector_distance_cos 사용 (느릴 수 있음) 또는 인덱스 활용

    // 문서 테이블: documents (id, content, file_path, project_id)
    // 임베딩 테이블: embeddings (document_id, embedding)

    const sql = `
    SELECT d.id, d.content, d.file_path, d.project_id,
           vector_distance_cos(e.embedding, vector(?)) as distance
    FROM embeddings e
    JOIN documents d ON e.document_id = d.id
    ORDER BY distance ASC
    LIMIT 5
  `;

    // 주의: @libsql/client의 execute는 바이너리 벡터 파라미터를 직접 지원하지 않을 수 있음.
    // 브라우저에서는 ArrayBuffer/Uint8Array를 넘겨야 할 수도 있습니다.

    const results = await db.execute({
        sql: sql,
        args: [vectorQuery] // passing as Buffer/ArrayBuffer
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
