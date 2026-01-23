#!/usr/bin/env node
/**
 * RAG Data Preparation Script
 * 
 * 이 스크립트는 24개 AI 에이전트 프로젝트를 스캔하여:
 * 1. 프로젝트 메타데이터를 추출
 * 2. 코드 파일을 청크로 분할
 * 3. Turso 데이터베이스에 저장
 */

import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Turso 클라이언트 초기화
const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

// 프로젝트 루트 디렉토리
const PROJECT_ROOT = path.join(__dirname, '../..');

// 스캔할 파일 확장자
const ALLOWED_EXTENSIONS = ['.py', '.md', '.ipynb', '.txt', '.js', '.ts'];

// 제외할 디렉토리
const EXCLUDED_DIRS = ['node_modules', '.git', '__pycache__', 'venv', '.venv', 'dist', 'build'];

/**
 * 프로젝트 디렉토리 목록 가져오기
 */
async function getProjectDirectories() {
    const entries = await fs.readdir(PROJECT_ROOT, { withFileTypes: true });

    return entries
        .filter(entry => entry.isDirectory())
        .filter(entry => /^\d{2}_/.test(entry.name)) // 01_, 02_ 형식
        .map(entry => entry.name)
        .sort();
}

/**
 * 디렉토리 내 모든 파일 재귀적으로 스캔
 */
async function scanDirectory(dirPath, projectId) {
    const files = [];

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // 제외 디렉토리 체크
                if (!EXCLUDED_DIRS.includes(entry.name)) {
                    const subFiles = await scanDirectory(fullPath, projectId);
                    files.push(...subFiles);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (ALLOWED_EXTENSIONS.includes(ext)) {
                    files.push({
                        path: fullPath,
                        relativePath: path.relative(PROJECT_ROOT, fullPath),
                        extension: ext
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning ${dirPath}:`, error.message);
    }

    return files;
}

/**
 * 파일 내용을 청크로 분할
 */
function chunkContent(content, maxTokens = 400) {  // 800 → 400으로 감소
    const chunks = [];
    const lines = content.split('\n');

    let currentChunk = [];
    let currentTokens = 0;

    for (const line of lines) {
        // 간단한 토큰 추정 (단어 수 * 1.3)
        const lineTokens = Math.ceil(line.split(/\s+/).length * 1.3);

        if (currentTokens + lineTokens > maxTokens && currentChunk.length > 0) {
            // 현재 청크 저장
            chunks.push(currentChunk.join('\n'));
            currentChunk = [line];
            currentTokens = lineTokens;
        } else {
            currentChunk.push(line);
            currentTokens += lineTokens;
        }
    }

    // 마지막 청크 저장
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
    }

    return chunks;
}

/**
 * 프로젝트 메타데이터 추출
 */
function extractProjectMetadata(projectDir) {
    const id = projectDir;
    const title = projectDir.replace(/^\d{2}_/, '').replace(/-/g, ' ');

    // 카테고리 추정
    let category = 'AI';
    if (title.includes('blockchain') || title.includes('web3')) {
        category = 'Blockchain';
    } else if (title.includes('3d') || title.includes('three')) {
        category = '3D';
    }

    // 키워드 추출
    const keywords = title.toLowerCase().split(/\s+/);

    return {
        id,
        title,
        category,
        description: `AI Agent project: ${title}`,
        tech_stack: JSON.stringify(['Python', 'AI', 'LangGraph']),
        keywords: JSON.stringify(keywords)
    };
}

/**
 * 프로젝트를 데이터베이스에 저장
 */
async function saveProject(metadata) {
    await turso.execute({
        sql: `
      INSERT OR REPLACE INTO projects (id, title, category, description, tech_stack, keywords)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
        args: [
            metadata.id,
            metadata.title,
            metadata.category,
            metadata.description,
            metadata.tech_stack,
            metadata.keywords
        ]
    });
}

/**
 * 문서 청크를 데이터베이스에 저장
 */
async function saveDocument(projectId, filePath, content, chunkIndex, language) {
    const result = await turso.execute({
        sql: `
      INSERT INTO documents (project_id, file_path, content, chunk_index, language, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
        args: [
            projectId,
            filePath,
            content,
            chunkIndex,
            language,
            JSON.stringify({ fileSize: content.length })
        ]
    });

    return result.lastInsertRowid;
}

/**
 * 메인 실행 함수
 */
async function main() {
    console.log('🚀 Starting RAG data preparation...\n');

    // 1. 프로젝트 디렉토리 목록 가져오기
    const projectDirs = await getProjectDirectories();
    console.log(`Found ${projectDirs.length} projects\n`);

    let totalFiles = 0;
    let totalChunks = 0;

    // 2. 각 프로젝트 처리
    for (const projectDir of projectDirs) {
        console.log(`📁 Processing: ${projectDir}`);

        // 프로젝트 메타데이터 저장
        const metadata = extractProjectMetadata(projectDir);
        await saveProject(metadata);

        // 프로젝트 파일 스캔
        const projectPath = path.join(PROJECT_ROOT, projectDir);
        const files = await scanDirectory(projectPath, metadata.id);

        console.log(`   Found ${files.length} files`);
        totalFiles += files.length;

        // 각 파일 처리
        for (const file of files) {
            try {
                const content = await fs.readFile(file.path, 'utf-8');
                const chunks = chunkContent(content);

                // 각 청크 저장
                for (let i = 0; i < chunks.length; i++) {
                    const language = file.extension.slice(1); // .py -> py
                    await saveDocument(metadata.id, file.relativePath, chunks[i], i, language);
                    totalChunks++;
                }
            } catch (error) {
                console.error(`   ⚠️  Error processing ${file.relativePath}:`, error.message);
            }
        }

        console.log(`   ✅ Saved ${files.length} files\n`);
    }

    console.log('✨ Data preparation complete!');
    console.log(`   Total projects: ${projectDirs.length}`);
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   Total chunks: ${totalChunks}`);
}

// 실행
main().catch(console.error);
