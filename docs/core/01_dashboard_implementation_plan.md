# 01 Dashboard Implementation Plan

## 1. 개요 (Objective)
본 문서는 20가지 AI 에이전트 프로젝트 폴더의 데이터를 자동으로 수집하여, Vite + React 기반의 대시보드 웹 어플리케이션에 시각화하기 위한 기술적 구현 방법과 워크플로우를 정의한다.

## 2. 데이터 수집 아키텍처 (Data Acquisition)

### 2.1 Static Data Scanning (Pre-build)
- **방법**: Node.js 기반의 전용 스캔 스크립트 (`scanner.ts`) 개발.
- **대상**: 프로젝트 루트의 `01_*` ~ `20_*` 폴더.
- **추출 항목**:
    - `README.md`: 프로젝트 설명 및 사용법 (Markdown).
    - `main.py`, `tools.py`, `workflow.py` 등 핵심 소스코드 (텍스트).
    - 폴더 생성일 및 수정일 (`fs.stat`).
    - `assets/` 또는 `output/` 폴더 내의 실행 결과물 (이미지 경로).

### 2.2 Output Format
추출된 데이터는 `dashboard-app/dashboard-ui/src/data/generated-projects.json` 파일로 저장되어 프론트엔드에서 정적으로 임포트된다.

## 3. 프론트엔드 구현 상세 (Frontend Implementation)

### 3.1 레이아웃 (3-Column Layout)
1. **Side Panel (Left)**: 프로젝트 리스트 및 필터링 기능.
2. **Detail Panel (Center)**: `README.md` 렌더링 및 실행 결과 시각화.
3. **Code Panel (Right)**: 다중 파일 지원 코드 뷰어 (Syntax Highlighting).

### 3.2 핵심 컴포넌트
- **MarkdownRenderer**: `markdown-to-jsx`를 활용하여 깃허브 스타일의 문서 렌더링.
- **CodeExplorer**: `react-syntax-highlighter`를 사용하며, 파일 탭 기능을 포함.
- **MotionContainer**: `framer-motion`을 활용한 부드러운 패널 전환 애니메이션.

### 3.3 로컬 자산 처리 (Asset Handling)
- 로컬 이미지는 `public/` 폴더로 복사하거나, 로컬 경로를 웹에서 접근 가능한 형식으로 매핑하는 전략 수행.

## 4. 구현 단계 (Implementation Phases)
1. **[Phase 1]**: Node.js 스캐너 스크립트 작성 및 JSON 생성 테스트.
2. **[Phase 2]**: React 대시보드에서 생성된 JSON 데이터를 기반으로 동적 라우팅/렌더링 구현.
3. **[Phase 3]**: 마크다운 및 코드 테마 UI 고도화 (Glassmorphism 적용).
4. **[Phase 4]**: 최종 검증 및 배포용 정적 빌드 수행.

## 5. 보안 및 안전성 (Safety)
- **Zod Validation**: 생성된 데이터 형식이 프론트엔드 타입 정의와 일치하는지 빌드 타임에 검증.
- **Error Boundary**: 특정 폴더의 데이터가 손상되었을 경우 대시보드 전체가 멈추지 않도록 예외 처리.
