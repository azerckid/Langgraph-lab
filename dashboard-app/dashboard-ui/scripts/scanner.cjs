const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../../');
const outputFilePath = path.join(__dirname, '../src/data/generated-projects.json');

// Manual descriptions map as a fallback or to match projects.ts
const descriptions = {
    "01": "AI 에이전트 개발의 시작을 위한 스타터 프로젝트",
    "02": "CrewAI를 활용한 지능형 뉴스 수집 및 보고 시스템",
    "03": "채용 공고 분석 및 이력서 최적화 지원 에이전트",
    "04": "자동화된 콘텐츠 생성 및 배포 파이프라인",
    "05": "AutoGen 기반의 심층 웹 리서치 멀티 에이전트 팀",
    "06": "다기능 도구를 갖춘 Streamlit 기반 AI 비서",
    "07": "메모리와 가드레일이 포함된 고객 지원 워크플로우",
    "08": "주식 및 재무 데이터 분석 투자 조문 에이전트",
    "09": "자동 대본 작성부터 영상 편집까지 수행하는 에이전트",
    "10": "이메일 커뮤니케이션 최적화 에이전트",
    "11": "맞춤형 여행 일정 및 정보 제공 어드바이저",
    "12": "LangGraph 핵심 기능(State, Routing, Caching 등) 학습 튜토리얼",
    "13": "Human-in-the-loop 기능이 포함된 시 작성 봇",
    "14": "비디오 분석을 통한 자동 썸네일 생성기",
    "15": "고급 에이전트 워크플로우 아키텍처 패턴",
    "16": "워크플로우 테스트 및 품질 검증 에이전트",
    "17": "멀티 에이전트 협업 구조 구현 예제",
    "18": "개인화 학습 경험을 제공하는 AI 튜터",
    "19": "에이전트 간 직접 통신 아키텍처 데모",
    "20": "FastAPI 기반 에이전트 배포 서버"
};

function scanProjects() {
    const projects = [];
    const items = fs.readdirSync(rootDir);

    const projectFolders = items.filter(item => {
        const fullPath = path.join(rootDir, item);
        return fs.statSync(fullPath).isDirectory() && /^\d{2}_/.test(item);
    }).sort();

    for (const folder of projectFolders) {
        const folderPath = path.join(rootDir, folder);
        const id = folder.split('_')[0];
        const titleParts = folder.split('_').slice(1);
        const title = titleParts.join(' ').replace(/-/g, ' ');

        // Read README.md
        let readme = '';
        const readmePath = path.join(folderPath, 'README.md');
        if (fs.existsSync(readmePath)) {
            readme = fs.readFileSync(readmePath, 'utf8');
        }

        // Discover ALL Source Codes (.py, .ipynb)
        const codes = {};
        const files = fs.readdirSync(folderPath);

        // Priority for mainCodePath
        let mainCodePath = '';
        const mainCandidates = ['main.py', 'main.ipynb', 'app.py'];

        for (const file of files) {
            if (file.endsWith('.py') || file.endsWith('.ipynb')) {
                const filePath = path.join(folderPath, file);
                const content = fs.readFileSync(filePath, 'utf8');

                if (file.endsWith('.ipynb')) {
                    try {
                        const notebook = JSON.parse(content);
                        const codeSegments = notebook.cells
                            .filter(cell => cell.cell_type === 'code')
                            .map(cell => {
                                const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
                                return source;
                            });
                        codes[file] = codeSegments.join('\n\n# ---\n\n');
                    } catch (e) {
                        codes[file] = content; // Fallback to raw if parsing fails
                    }
                } else {
                    codes[file] = content;
                }

                if (!mainCodePath && mainCandidates.includes(file)) {
                    mainCodePath = `${folder}/${file}`;
                }
            }
        }

        // If no candidate found, pick the first code file
        if (!mainCodePath && Object.keys(codes).length > 0) {
            mainCodePath = `${folder}/${Object.keys(codes)[0]}`;
        }

        // Try to find any output images
        const assets = [];
        const possibleAssetDirs = ['.', 'output', 'assets', 'images'];
        const publicAssetsDir = path.join(__dirname, '../public/assets');

        if (!fs.existsSync(publicAssetsDir)) {
            fs.mkdirSync(publicAssetsDir, { recursive: true });
        }

        for (const dir of possibleAssetDirs) {
            const dirPath = path.join(folderPath, dir);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                const subFiles = fs.readdirSync(dirPath);
                for (const file of subFiles) {
                    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
                        const sourcePath = path.join(dirPath, file);
                        const assetSubDir = path.join(publicAssetsDir, folder);
                        if (!fs.existsSync(assetSubDir)) {
                            fs.mkdirSync(assetSubDir, { recursive: true });
                        }
                        const targetPath = path.join(assetSubDir, file);
                        fs.copyFileSync(sourcePath, targetPath);

                        assets.push(`assets/${folder}/${file}`);
                    }
                }
            }
        }

        // Cleanup duplicate assets (if some are in root and subdirs)
        const uniqueAssets = [...new Set(assets)];

        projects.push({
            id,
            title: title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: descriptions[id] || "No description available.",
            directory: folder,
            readmePath: `${folder}/README.md`,
            mainCodePath: mainCodePath || `${folder}/main.py`,
            readme,
            codes,
            assets: uniqueAssets,
            techStack: extractTechStack(readme)
        });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(projects, null, 2));
    console.log(`Scan complete! ${projects.length} projects found.`);
}

function extractTechStack(readme) {
    const stacks = [];
    const lowerReadme = readme.toLowerCase();

    if (lowerReadme.includes('crewai')) stacks.push('CrewAI');
    if (lowerReadme.includes('langgraph')) stacks.push('LangGraph');
    if (lowerReadme.includes('gemini')) stacks.push('Gemini');
    if (lowerReadme.includes('autogen')) stacks.push('AutoGen');
    if (lowerReadme.includes('google adk') || lowerReadme.includes('google-genai')) stacks.push('Google ADK');
    if (lowerReadme.includes('fastapi')) stacks.push('FastAPI');
    if (lowerReadme.includes('streamlit')) stacks.push('Streamlit');
    if (lowerReadme.includes('python')) stacks.push('Python');
    if (lowerReadme.includes('openai')) stacks.push('OpenAI');
    if (lowerReadme.includes('zod')) stacks.push('Zod');

    // Add Tutorial tag for folder 12
    if (lowerReadme.includes('tutorial')) stacks.push('Tutorial');

    return stacks.length > 0 ? [...new Set(stacks)] : ['Python'];
}

scanProjects();
