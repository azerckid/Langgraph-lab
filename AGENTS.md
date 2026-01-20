# AGENTS.md

Welcome! I am your AI coding agent. This file follows the [AGENTS.md](https://agents.md/) standard to provide me with the context and instructions I need to work on the **AZERC Portfolio (Full-Stack & Specialized Integration)** project effectively.

## Project Overview
이 프로젝트는 20가지의 다양한 AI 에이전트 프로젝트(CrewAI, LangGraph, AutoGen, Google ADK 등 활용)를 체계적으로 분류하고 시각화하는 **AI 에이전트 마스터클래스 교육용 대시보드**입니다. 학습자들이 각 에이전트의 목적, 실행 결과, 그리고 실제 파이썬 코드를 한 화면에서 직관적으로 확인하고 학습할 수 있는 통합 플랫폼을 지향합니다.

### Core Objectives
- **에이전트 시각화**: 20개의 AI 에이전트 프로젝트를 사이드바 메뉴로 구성하여 누구나 쉽게 탐색할 수 있도록 구현.
- **교육적 코드 리뷰**: 실행 결과와 파이썬 소스코드를 병렬로 배치하여 로직과 결과의 상관관계를 한눈에 파악.
- **통합 학습 환경**: README 기반의 프로젝트 설명과 실제 출력물(이미지, 로그 등)을 통합 제공하여 실질적인 학습 도구로 활용.
- **프리미엄 UI/UX**: Vite, React 및 shadcn/ui를 활용하여 미래지향적이고 직관적인 다크 모드 기반의 교육용 인터페이스 구축.

### Key Expertise & Projects
- **AI Agent Automation**: [News Reader & Job Hunter] - CrewAI와 Gemini를 활용하여 정보 수집 및 분석 프로세스를 자동화한 사례.
- **Workflow Orchestration**: [Customer Support & Tutor] - LangGraph의 State 관리 및 Human-in-the-loop 기능을 활용한 고도화된 워크플로우 설계.
- **Multi-Agent Systems**: [Deep Research & A2A] - 여러 에이전트가 협력하거나 에이전트 간 직접 통신하는 복합 아키텍처 구현.
- **Content Creation Pipeline**: [Shorts Maker & Thumbnail] - Google ADK와 멀티모달 모델을 결합하여 미디어 콘텐츠 제작 전 과정을 자동화.
- **Interactive Educational Dashboard**: [Main Dashboard] - 20가지 에이전트를 실시간으로 탐색하고 코드와 결과를 리뷰할 수 있는 Vite 기반 플랫폼.



## Setup Commands

### Project Setup
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`
- Lint the project: `npm run lint`

### Frontend
- Initialize project (shadcn preset): `npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=hugeicons&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=vite" --template vite`
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build production bundle: `npm run build`

## Tech Stack

### Core Framework
- **Framework**: React 18+ (Vite)
- **Runtime**: Node.js 20+
- **Language**: TypeScript ^5

### Backend
- **Runtime**: Node.js 18+ or Python 3.13+
- **Framework**: Express.js/Fastify (Node.js) or FastAPI (Python)
- **Database**: Turso (SQLite)
- **ORM**: Drizzle ORM
- **Validation**: Zod (TypeScript) or Pydantic (Python)
- **Authentication**: Better Auth

### Frontend & UI
- **Styling**: Tailwind CSS ^4.0.0-alpha
- **UI Components**: shadcn/ui (Nova style)
- **Icons**: Lucide React, HugeIcons
- **Date/Time**: Luxon
- **Validation**: Zod (TypeScript)

### Infrastructure
- **Hosting**: Vercel

## Code Style & Conventions

### General
- Use **TypeScript** for all files
- Implement comprehensive error handling with proper error types
- Follow RESTful design for API routes
- Implement rate limiting and secure headers where applicable

### Frontend
- Use functional components and React Hooks
- Follow shadcn/ui design system for UI consistency
- Use **Zod** for client-side and form validation
- Use **Luxon** for all date and time operations
- **Style Conventions**:
  - Tailwind CSS v4 syntax and patterns.
  - Maintain editor linting via `.vscode/settings.json`.
- **Vite/React Patterns**:
  - Follow component-based architecture with hooks for state management.
  - Use React.lazy for route/component level splitting where necessary.
- Use **Toast notifications** (Sonner) for user feedback:
  - Success: Data submission, profile update, etc.
  - Error: API failures, validation errors
  - Info: Background tasks, updates
- **Error Handling**: Always implement comprehensive error handling:
  - Check for errors in all API responses
  - Display errors using `toast.error()` instead of raw error messages
  - Provide clear visual feedback for all user actions

## Communication Rules
- **[No Emojis]** 사용자와의 모든 채팅 대화에서 이모지(Emoji) 및 이모티콘(Emoticon) 사용을 전면 금지합니다.
- **[Documentation-First Implementation]** If the USER requests a task or technical implementation that is not defined in the existing documentation, you must first clarify that it is outside the current scope and ask if the documentation should be updated before proceeding with the implementation. (문서에 정의되지 않은 작업을 수행하기 전, 반드시 문서 업데이트 여부를 먼저 확인하십시오.)

### Git
- Git commit messages must follow Conventional Commits in Korean
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(ui): 버튼 컴포넌트 스타일 개선`

## Workflow & Safety
- **[Safe Checkpoint Strategy]** 새로운 작업이나 중요한 변경(새 파일 생성, DB 스키마 수정, 패키지 설치 등)을 시작하기 전에, 반드시 현재 상태를 git commit하거나 작업 디렉토리가 깨끗한지 확인을 요청해야 합니다.

## Testing Instructions
- Currently, tests are being integrated as part of the development phase (Phase 9).
- Run available tests using: `npm test`

## Documentation Standards

### Key Documents
- `docs/PLAN.md`: 프로젝트 기획서 및 비즈니스 모델
- `docs/IMPLEMENTATION_PLAN.md`: 개발 구현 계획서 및 기술 아키텍처

### [Strict Document Hierarchy Rule]
To ensure the structural integrity and maintainability of the project, all documentation within the `docs/` directory must be strictly categorized into the following 7 core sub-directories (as defined in `DOCUMENT_MANAGEMENT_PLAN.md`):

1. **`docs/core/`**: System-wide design foundations, DB schemas, and standard rules.
2. **`docs/features/`**: Detailed specifications of how individual features (billing, ai, chat, etc.) currently operate.
3. **`docs/roadmap/`**: Future implementation plans and strategic proposals.
4. **`docs/reports/`**: Historical verification reports and test results from previous phases.
5. **`docs/guides/`**: Practical guides and troubleshooting notes for developers and operators.
6. **`docs/stitch/`**: Detailed UI/UX designs and flowcharts for each screen.
7. **`docs/archive/`**: Legacy documentation retained for historical context only.

AI agents MUST respect this hierarchy when creating or modifying documents and proactively rebase misplaced files.

### [Document Prefix Numbering Rule]
When creating or naming documentation files, **prefix numbers must be attached** to indicate the chronological order in which documents were actually worked on. This prefix serves solely as a visual indicator of the sequence of documentation work. While the actual completion status of a document can be determined by dates recorded within the document itself, the prefix number is necessary for quickly identifying the order of document creation and should always be included when writing documentation.


## Development Standards & Critical Rules

### [CRITICAL: DATABASE INTEGRITY RULE]
You are strictly prohibited from performing any database operations, including migrations, schema resets, or structural changes, without first creating a complete data backup (dump). Data preservation is your absolute priority. Never execute destructive commands like 'DROP TABLE' or 'migrate reset' until a verifiable backup has been secured and confirmed.

### [MANDATORY BACKUP PROCEDURE]
Before initiating any database-related tasks, you must perform a full export of all existing records. This is a non-negotiable prerequisite for any migration or schema update. You must ensure that both user-generated content and administrative data are fully protected against loss before any changes are applied.

### [STRICT ADHERENCE TO STANDARDS]
Never suggest or implement "quick fixes," "short-cuts," or temporary workarounds. You must always prioritize formal, standardized, and industry-best-practice methodologies. All proposed solutions must be production-ready and architecturally sound, focusing on long-term stability and correctness over immediate speed.

### [NO TEMPORARY PATCHES]
You are strictly forbidden from proposing temporary bypasses or "quick-and-dirty" solutions. Every recommendation and implementation must follow the most formal and correct path. Prioritize robustness and adherence to professional engineering standards in every decision, ensuring that no technical debt is introduced for the sake of convenience.

### [Side-Effect Isolation]
When modifying shared components or logic, you MUST analyze the 'Impact Scope' first. Ensure that changes intended for a specific use case (e.g., AI features) do not inadvertently affect general functionality (e.g., normal chat). You MUST strictly isolate such logic using conditional checks or specific guards.

### [Strict Document Integrity Rule]
When updating or modifying any strategy, implementation, or design documents, you MUST strictly preserve the existing framework, formatting, and structural integrity. Do not perform total overwrites that discard previous detailed technical specifications, historical context, or complex logic. All updates must be made incrementally and appropriately integrated into the current structure to ensure no data loss or architectural context is sacrificed.

### [Strict Document Persistence Rule]
When updating or modifying any document, you MUST NOT overwrite, delete, or discard the existing content, historical context, or previous specifications. All updates must be made by appending new information or integrating changes incrementally while preserving the original framework. This ensures that the entirety of the project's evolution, including past technical decisions and verification records, remains fully traceable.

### [Standard Rules for Environment Variable Management]
1. **Strategic Isolation of Environments**
   - **Principle**: Maintain strict separation between Local and Production environments using file suffixes.
   - **Workflow**: Use `.env.development` or `.env.local` for local execution (test keys, localhost URLs). Use `.env.production` as the source of truth for deployment parameters.
   - **Priority**: AI must respect the framework's priority logic (typically: `.env.development`/`.env.local` overrides `.env`).

2. **Zero-Leak Security Policy (Git Integrity)**
   - **Rule**: No part of any `.env*` file shall ever be committed to a Version Control System (VCS).
   - **Verification**: AI must proactively audit `.gitignore` to ensure global patterns like `.env*` are effectively blocking all potential environment files before suggesting any variable updates.

3. **Cloud-Native Secret Management**
   - **Deployment Strategy**: Environment variables in production must be managed via the hosting provider's secure dashboard (e.g., Vercel, AWS) or CLI, never via file transmission to the server.
   - **Automation**: When syncing variables, prioritize using official CLIs to pull/push secrets between the local .env files and the cloud environment to prevent manual entry errors.

4. **Context-Aware Variable Configuration**
   - **Dynamic Mapping**: Redirection URLs, Auth providers, and Database connection strings must be dynamically configured to point to localhost in development and the verified production domain in deployment, managed through the isolated .env files.

### [React Performance Standards (Adapted from Vercel Engineering)]
All frontend development MUST strictly adhere to modern React engineering best practices.
**Primary Source of Truth: [React Router v7 Documentation](https://reactrouter.com/home)**

**Architectural Reference:**
We adopt Vercel's high-performance principles (Anti-Waterfalls, Zero-Bloat) but verify implementation details against React Router patterns.
*For conceptual guidance, consult the local knowledge base at `.agent/skills/vercel-react-best-practices/`.*
*(Note: If the skill is missing, retrieve it from [SkillsCokac](https://skills.cokac.com/) or install via `npx skillscokac -i vercel-react-best-practices`. Always apply rules within the context of React Router v7.)*

1. **Eliminate Waterfalls**: Strictly prohibit sequential blocking data fetches. Always use `Promise.all` for parallel execution or leverage `Suspense` for streaming.
2. **Zero-Bundle-Bloat**: 
   - Mandate `React.lazy` (lazy loading) for heavy components.
   - Prohibition of "Barrel Files" (re-exporting index files) in ways that break tree-shaking.
3. **Server-Centric Optimizations**: Prioritize server-side data fetching (Loaders) and transformation to minimize client payload.
4. **Core Rules Enforcement**: 
   - Consult the rules in `.agent/skills/vercel-react-best-practices/rules/` for specific patterns (e.g., `rendering-content-visibility.md`, `js-early-exit.md`).