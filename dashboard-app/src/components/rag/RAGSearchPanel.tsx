import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, FileText, Search, Sparkles } from "lucide-react";
import { searchAndAnswer, type RAGResponse, type SearchResult } from '../../lib/rag/search';
import Markdown from 'markdown-to-jsx';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SearchResult[];
    timestamp: Date;
}

export function RAGSearchPanel() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your AI Agent Lab assistant. Ask me anything about the 24 agent projects, implementation details, or code logic.",
            timestamp: new Date()
        }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        try {
            // RAG 검색 및 답변 생성
            const result: RAGResponse = await searchAndAnswer(userMessage.content);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.answer,
                sources: result.sources,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('RAG Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error while processing your request. Please check your API keys or try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[700px] border-muted shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">AI Documentation Assistant</CardTitle>
                        <CardDescription className="text-xs">Powered by Gemini 2.5 & Turso Vector Search</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col">
                {/* Messages Options */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>

                            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`rounded-xl p-4 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted/50 border border-muted-foreground/10'
                                    }`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50">
                                            <Markdown>{msg.content}</Markdown>
                                        </div>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>

                                {/* Sources Section */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="w-full mt-1 space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                            <Search className="h-3 w-3" />
                                            References
                                        </p>
                                        <div className="grid gap-2">
                                            {msg.sources.slice(0, 3).map((source, idx) => (
                                                <div key={idx} className="flex flex-col gap-1 rounded-md border bg-background/50 p-2 text-xs transition-colors hover:bg-muted/50">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileText className="h-3 w-3" />
                                                        <span className="font-mono text-[10px]">{source.metadata.projectId}/{source.metadata.filePath}</span>
                                                        <Badge variant="outline" className="ml-auto text-[9px] h-4">
                                                            {Math.round((1 - source.distance) * 100)}% match
                                                        </Badge>
                                                    </div>
                                                    <p className="line-clamp-2 text-muted-foreground/80 pl-5 border-l-2 border-primary/20">
                                                        {source.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="rounded-xl bg-muted/50 p-4 border border-muted-foreground/10 flex items-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-background/95 backdrop-blur">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask about the codebase..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !query.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
