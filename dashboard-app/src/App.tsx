import { useState } from 'react';
import type { Project } from './types';
import projectsDataRaw from './data/generated-projects.json';
import Markdown from 'markdown-to-jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    Search,
    PanelLeft,
    Code2,
    FileText,
    Box,
    ChevronRight,
    ExternalLink,
    Github,
    Monitor,
    Sparkles
} from "lucide-react";
import { RAGSearchPanel } from './components/rag/RAGSearchPanel';

const projectsData = (projectsDataRaw as unknown) as Project[];

const App = () => {
    // Safety check for empty data
    if (!projectsData || projectsData.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Error: No Projects Found</CardTitle>
                        <CardDescription>
                            The project data could not be loaded. Please ensure <code>src/data/generated-projects.json</code> is populated.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const [selectedProject, setSelectedProject] = useState<Project>(projectsData[0]);
    const [activeFile, setActiveFile] = useState<string>(
        selectedProject?.codes ? Object.keys(selectedProject.codes)[0] || '' : ''
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const filteredProjects = projectsData.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.includes(searchQuery)
    );

    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project);
        setActiveFile(Object.keys(project.codes || {})[0] || '');
        // Keep current tab unless it's code view and file changed widely, actually keeping tab is better UX
    };

    const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.length > 3) {
            setSubmittedSearchQuery(searchQuery);
            setActiveTab('ask-ai');
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40 font-sans antialiased text-foreground">
            {/* Sidebar - Desktop */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex h-14 items-center border-b px-6">
                    <a href="/" className="flex items-center gap-2 font-semibold">
                        <Box className="h-5 w-5 text-primary" />
                        <span className="tracking-tight">AI Agent Studio</span>
                    </a>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <div className="mb-2 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            Agent Collections
                        </div>
                        {filteredProjects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => handleProjectSelect(project)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${selectedProject.id === project.id
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-background text-[10px] font-bold">
                                    {project.id}
                                </span>
                                <span className="truncate">{project.title}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                    <Card className="bg-muted/50 border-none shadow-none">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs">Progress Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${(projectsData.length / 20) * 100}%` }} />
                                </div>
                                <span className="text-[10px] font-mono">{projectsData.length}/20</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">
                                Complete all projects to master autonomous agents.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col sm:pl-64 w-full">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-8 py-4">
                    <Button variant="outline" size="icon" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>

                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Agents</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{selectedProject.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="relative ml-auto flex-1 md:grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects or ask AI..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleGlobalSearch}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                        <Github className="h-4 w-4" />
                    </Button>
                </header>

                {/* Main Body */}
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-8 sm:py-0 md:gap-8 pb-10">
                    <div className="mx-auto grid w-full max-w-[1400px] gap-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedProject.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono text-[10px] font-bold px-2 py-0 border-primary/10 bg-primary/5 text-primary">
                                            AGENT {selectedProject.id}
                                        </Badge>
                                    </div>
                                    <div className="flex items-end justify-between gap-4 border-b pb-6">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                                {selectedProject.title}
                                            </h1>
                                            <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
                                                {selectedProject.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="gap-2 h-9">
                                                <Monitor className="h-4 w-4" />
                                                Live Demo
                                            </Button>
                                            <Button size="sm" className="gap-2 h-9">
                                                <ExternalLink className="h-4 w-4" />
                                                View Project
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <TabsList className="bg-background border h-10 p-1">
                                            <TabsTrigger value="overview" className="gap-2 px-4 data-[state=active]:bg-muted">
                                                <FileText className="h-4 w-4" />
                                                Overview
                                            </TabsTrigger>
                                            <TabsTrigger value="code" className="gap-2 px-4 data-[state=active]:bg-muted">
                                                <Code2 className="h-4 w-4" />
                                                Code View
                                            </TabsTrigger>
                                            <TabsTrigger value="ask-ai" className="gap-2 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                                <Sparkles className="h-4 w-4 text-primary" />
                                                Ask AI
                                            </TabsTrigger>
                                        </TabsList>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.techStack.map(tech => (
                                                <Badge key={tech} variant="secondary" className="font-normal text-[11px] h-6">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                                        {/* Primary Content (Overview or Editor or AI) */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <TabsContent value="overview" className="m-0 border-none p-0 focus-visible:ring-0">
                                                <Card className="shadow-sm border-muted">
                                                    <CardContent className="p-8">
                                                        <div className="prose prose-neutral dark:prose-invert max-w-none markdown-content font-sans">
                                                            <Markdown>
                                                                {selectedProject.readme || 'No documentation found.'}
                                                            </Markdown>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Assets section below README in Overview */}
                                                {selectedProject.assets && selectedProject.assets.length > 0 && (
                                                    <div className="mt-8 space-y-4">
                                                        <h3 className="text-lg font-semibold tracking-tight">Execution Artifacts</h3>
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            {selectedProject.assets.map((asset, idx) => (
                                                                <Card key={idx} className="overflow-hidden border-muted shadow-sm group">
                                                                    <div className="aspect-video bg-muted relative">
                                                                        <img
                                                                            src={`/${asset}`}
                                                                            alt={`Result ${idx + 1}`}
                                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                        />
                                                                    </div>
                                                                    <CardHeader className="p-3 border-t bg-muted/50">
                                                                        <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                                            <ChevronRight className="h-3 w-3" />
                                                                            artifact_{idx + 1}.png
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="code" className="m-0 border-none p-0 focus-visible:ring-0">
                                                <Card className="shadow-sm border-muted flex flex-col h-[700px] overflow-hidden">
                                                    <div className="flex bg-muted/30 border-b overflow-x-auto scrollbar-hide">
                                                        {Object.keys(selectedProject.codes || {}).map(fileName => (
                                                            <button
                                                                key={fileName}
                                                                onClick={() => setActiveFile(fileName)}
                                                                className={`px-4 py-2.5 text-[11px] font-mono transition-all border-r border-border/10 flex items-center gap-2 ${activeFile === fileName
                                                                    ? 'bg-background text-primary border-b-2 border-b-primary shadow-sm'
                                                                    : 'text-muted-foreground hover:bg-muted/50'
                                                                    }`}
                                                            >
                                                                <Code2 className="h-3 w-3" />
                                                                {fileName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex-1 overflow-auto bg-[#0d0d0f] p-4 text-[12px] font-mono leading-relaxed">
                                                        <SyntaxHighlighter
                                                            language={(activeFile.endsWith('.py') || activeFile.endsWith('.ipynb')) ? 'python' : 'javascript'}
                                                            style={atomDark}
                                                            customStyle={{
                                                                background: 'transparent',
                                                                padding: 0,
                                                                margin: 0,
                                                                fontSize: '12px'
                                                            }}
                                                            showLineNumbers={true}
                                                            lineNumberStyle={{
                                                                minWidth: '2.5rem',
                                                                paddingRight: '1rem',
                                                                color: '#444',
                                                                textAlign: 'right',
                                                            }}
                                                        >
                                                            {String(selectedProject.codes?.[activeFile] || '# No content available')}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                    <div className="border-t bg-muted/30 p-2 px-4 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                                                        <div className="flex gap-4">
                                                            <span>Ln 1, Col 1</span>
                                                            <span>UTF-8</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 uppercase tracking-tighter">
                                                            <span>Ready</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </TabsContent>

                                            <TabsContent
                                                value="ask-ai"
                                                forceMount
                                                className="m-0 border-none p-0 focus-visible:ring-0 data-[state=inactive]:hidden"
                                            >
                                                <RAGSearchPanel initialQuery={submittedSearchQuery} />
                                            </TabsContent>
                                        </div>

                                        {/* Info Sidebar */}
                                        <div className="space-y-6">
                                            <Card className="shadow-sm border-muted bg-muted/10">
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-semibold tracking-tight uppercase tracking-wider text-muted-foreground/80">Project Specs</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Main Directory</span>
                                                        <span className="text-sm font-mono truncate bg-muted px-2 py-1 rounded border overflow-hidden">{selectedProject.directory}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Runtime</span>
                                                        <span className="text-sm font-medium">Python 3.12 (Conda Environment)</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Library Stack</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {selectedProject.techStack.map(t => (
                                                                <Badge key={t} variant="outline" className="text-[9px] h-5 rounded-sm">{t}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="shadow-sm border-muted overflow-hidden relative">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <ShieldCheck className="h-4 w-4 text-primary/20" />
                                                </div>
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-semibold tracking-tight uppercase tracking-wider text-muted-foreground/80">Key Challenges</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-3 text-sm">
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">1</div>
                                                            <p className="text-muted-foreground leading-tight">Managing multi-agent communication overhead.</p>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">2</div>
                                                            <p className="text-muted-foreground leading-tight">Refining tool-output parsing for complex tasks.</p>
                                                        </li>
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </Tabs>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Helper for one missing icon just in case
const ShieldCheck = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);

export default App;