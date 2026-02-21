import React from 'react';

interface Insight {
    id: number;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'info';
}

interface AIInsightsCardProps {
    insights: Insight[];
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ insights }) => {
    return (
        <div className="glass-panel p-6 h-full hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-white/10">
            <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Insights
            </h2>
            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="ml-3 text-sm text-[var(--color-text-muted)]">{insight.message}</p>
                    </div>
                ))}
                {insights.length === 0 && (
                    <p className="text-[var(--color-text-muted)] text-center py-4">No insights available yet.</p>
                )}
            </div>
            <button className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm font-medium">
                Ask AI Coach
            </button>
        </div>
    );
};

export default AIInsightsCard;
