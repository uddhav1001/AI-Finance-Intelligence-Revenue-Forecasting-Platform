import React, { useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

interface FinancialChartProps {
    lineData: any[];
    pieData: any[];
    barData?: any[];
    type?: 'trend' | 'monthly' | 'category' | 'composition';
}

const FinancialChart: React.FC<FinancialChartProps> = ({ lineData, pieData, barData = [], type }) => {
    const [chartType, setChartType] = useState<'trend' | 'monthly' | 'category' | 'composition'>(type || 'trend');

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1'];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const renderChart = () => {
        const gridColor = "rgba(0, 0, 0, 0.1)";
        const axisColor = "var(--color-text-muted)";
        const tooltipStyle = {
            backgroundColor: 'var(--color-bg-card)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            border: 'var(--border-glass)',
            boxShadow: 'var(--shadow-glass)',
            color: 'var(--color-text-main)'
        };

        switch (chartType) {
            case 'trend':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                labelStyle={{ color: 'var(--color-text-muted)' }}
                                formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value, '']}
                            />
                            <Legend wrapperStyle={{ color: 'var(--color-text-main)' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#3b82f6" }} />
                            <Line type="monotone" dataKey="expense" stroke="#f43f5e" name="Expense" strokeWidth={2} dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#f43f5e" }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'monthly':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                labelStyle={{ color: 'var(--color-text-muted)' }}
                                formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value, '']}
                            />
                            <Legend wrapperStyle={{ color: 'var(--color-text-main)' }} />
                            <Bar dataKey="revenue" stackId="a" fill="var(--color-accent)" name="Revenue" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="expense" stackId="a" fill="var(--color-danger)" name="Expense" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'category':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pieData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                            <XAxis type="number" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} width={100} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value, 'Amount']}
                            />
                            <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]}>
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'composition':
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                isAnimationActive={false}
                                stroke="none"
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value, 'Amount']}
                            />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--color-text-main)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="glass-panel p-6 min-h-[450px] flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                    {chartType === 'trend' && 'Financial Trends (Line)'}
                    {chartType === 'monthly' && 'Monthly Composition (Stacked)'}
                    {chartType === 'category' && 'Expense by Category (Bar)'}
                    {chartType === 'composition' && 'Expense Classification (Pie)'}
                </h3>
                {!type && (
                    <div className="flex flex-wrap justify-center gap-2 bg-[rgba(255,255,255,0.05)] p-1 rounded-lg">
                        {(['trend', 'monthly', 'category', 'composition'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setChartType(t)}
                                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all capitalize ${chartType === t
                                    ? 'bg-[var(--color-primary)] text-white shadow-lg'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[rgba(255,255,255,0.1)]'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                {renderChart()}
            </div>
        </div>
    );
};

export default FinancialChart;
