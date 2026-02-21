import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import AIInsightsCard from '../components/AIInsightsCard';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const AICoach = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your AI Finance Coach. I can analyze your spending and help you save money. Ask me anything!", sender: 'ai', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial fetch for proactive insights
    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await api.post('/ai/analyze', {});
                if (res.data.insights) {
                    setInsights(res.data.insights);
                }
            } catch (err) {
                console.error("Failed to fetch initial insights", err);
            }
        };
        fetchInsights();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/analyze', { query: input });

            const aiMessage: Message = {
                id: messages.length + 2,
                text: res.data.chatResponse || "I analyzed your data but couldn't generate a specific response.",
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);

            // Update insights if new ones returned
            if (res.data.insights && res.data.insights.length > 0) {
                setInsights(res.data.insights);
            }

        } catch (err) {
            console.error(err);
            const errorMessage: Message = {
                id: messages.length + 2,
                text: "Sorry, I encountered an error processing your request.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 p-4">
            {/* Chat Section */}
            <div className="flex-1 flex flex-col glass-panel border-none overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-slate-800/30">
                    <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center">
                        <span className="mr-2 text-xl">🤖</span> AI Financial Coach
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/20 rounded-br-none'
                                : 'bg-slate-800/80 text-[var(--color-text-main)] border border-white/10 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <span className="text-[10px] opacity-70 block text-right mt-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800/80 border border-white/10 p-4 rounded-2xl rounded-bl-none">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-slate-800/30">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your spending..."
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-[var(--color-text-main)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-primary)]/20 hover:-translate-y-0.5 transition-all"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>

            {/* Insights Sidebar (Desktop only or collapsible) */}
            <div className="w-80 hidden lg:block overflow-y-auto">
                <AIInsightsCard insights={insights} />

                <div className="mt-6 glass-panel p-4 border-none">
                    <h3 className="font-bold text-[var(--color-text-main)] mb-3">Suggested Questions</h3>
                    <div className="space-y-2">
                        {['How much did I spend on Food?', 'How can I save money?', 'Show me my recent activity'].map((q, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(q)}
                                className="w-full text-left text-sm p-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-white/5 text-[var(--color-primary)] transition-all"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
