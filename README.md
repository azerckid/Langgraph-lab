# 🤖 AI Agent Ecosystem & Dashboard

여러 단계의 학습과 실험을 통해 구축된 **AI 에이전트 프로젝트 폴더**와 이들을 통합 관리하는 **현대적인 화이트 톤의 실험실 대시보드**입니다.

## 🚀 프로젝트 개요
이 저장소는 총 20개의 전문화된 AI 에이전트 프로젝트 아카이브와, 각 프로젝트의 코드와 상태를 한눈에 파악할 수 있는 대시보드 인터페이스를 포함하고 있습니다. 각 에이전트는 LangGraph, OpenAI, Gemini 등 최신 AI 스택을 활용하여 특정 태스크를 수행하도록 설계되었습니다.

## 📁 주요 구조
```text
.
├── 01_myfirst_agent ~ 20_deploy-agents  # 20개의 개별 AI 에이전트 프로젝트
├── dashboard-app/
│   └── dashboard-ui/                    # Vite + React + Tailwind CSS 기반 대시보드
├── AGENTS.md                            # 에이전트 상세 명세 (JSON 기반)
└── README.md                            # 본 문서
```

## ✨ 핵심 기능
- **통합 프로젝트 스캐닝**: `scanner.cjs` 스크립트를 통해 하위 20개 폴더를 자동 스캔하여 데이터 최신화
- **실험실 대시보드(Laboratory UI)**: 
  - **White & Neutral Theme**: Shadcn/UI 디자인 시스템을 활용한 프리미엄 UI
  - **코드 브라우저**: 에이전트의 핵심 로직(.py, .ts, .json 등)을 대시보드 내에서 바로 확인
  - **실생활 데이터 동기화**: 프로젝트의 생성일, 주요 기능 등을 자동으로 파싱하여 표시

## 🛠 기술 스택
- **Dashboard**: React 19, Vite, Tailwind CSS 4, Framer Motion, Shadcn/UI (Base UI)
- **Agents**: LangGraph, Python, OpenAI SDK, Google AI SDK (Gemini)
- **Processing**: Node.js, Zod (Validation), Luxon (Time)

## 💻 시작하기

### 1. 대시보드 실행
```bash
cd dashboard-app/dashboard-ui
npm install
npm run dev
```

### 2. 프로젝트 스캔 (데이터 업데이트)
새로운 에이전트를 추가하거나 코드를 수정했을 때 실행합니다.
```bash
cd dashboard-app/dashboard-ui
node scripts/scanner.cjs
```

## 📝 개발 규칙 (Guidelines)
- **Safe Checkpoint**: 모든 주요 변경 사항은 커밋 전 빌드 테스트와 린트 체크(`npm run lint`)를 거칩니다.
- **Side-Effect Isolation**: 공통 UI 수정 시 다른 프로젝트 뷰에 영향을 주지 않도록 로직을 격리합니다.
- **Data Integrity**: `generated-projects.json`은 스캐너를 통해서만 업데이트하는 것을 권장합니다.
