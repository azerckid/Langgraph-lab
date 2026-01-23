-- RAG System Database Schema for Turso
-- Created: 2026-01-24
-- Description: Projects, Documents, and Vector Embeddings tables

-- 1. Projects Table: 프로젝트 메타데이터
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT,    -- JSON array: ["Python", "LangGraph", ...]
  keywords TEXT,      -- JSON array: ["langgraph", "agent", "state management", ...]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Documents Table: 코드 청크 및 문서
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  language TEXT,      -- python, typescript, markdown, etc.
  metadata TEXT,      -- JSON: {"lineStart": 10, "lineEnd": 50, "functionName": "create_graph"}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. Embeddings Table: 벡터 임베딩 (Gemini text-embedding-004: 768 차원)
CREATE TABLE IF NOT EXISTS embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  embedding BLOB NOT NULL,  -- 768-dimensional vector from Gemini
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 4. Indexes: 검색 성능 최적화
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_file ON documents(file_path);
CREATE INDEX IF NOT EXISTS idx_documents_language ON documents(language);
CREATE INDEX IF NOT EXISTS idx_embeddings_document ON embeddings(document_id);

-- Note: Vector similarity search index will be created separately
-- using Turso's vector extension: CREATE INDEX idx_embeddings_vector ON embeddings(embedding);
