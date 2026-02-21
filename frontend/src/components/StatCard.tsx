import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon }) => {
    return (
        <div className="glass-panel p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 border border-white/40">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
                    <p className="text-2xl font-bold mt-1 text-[var(--color-text-main)]">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-[var(--color-primary-dark)] text-[var(--color-primary)] bg-opacity-20`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${trendUp ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]'}`}>
                    {trend}
                </span>
                <span className="text-sm text-[var(--color-text-muted)] ml-2">from last month</span>
            </div>
        </div>
    );
};

export default StatCard;
