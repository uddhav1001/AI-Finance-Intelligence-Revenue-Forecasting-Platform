import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import FinancialChart from '../components/FinancialChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DashboardData {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    forecastRevenue: number;
    revenueChange: number;
    expenseChange: number;
    profitChange: number;
    growth: number;
    aiInsights: any[];
    pieChartData: any[];
    lineChartData: any[];
    barChartData: any[];
}

const Reports = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
                setError('Failed to load reports data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[var(--color-danger)]">
                {error}
            </div>
        );
    }

    const handleDownloadPDF = async () => {
        console.log("Starting PDF download...");
        const input = document.getElementById('report-content');
        if (!input) {
            console.error("Report content element not found!");
            return;
        }

        try {
            console.log("Capturing canvas...");
            const canvas = await html2canvas(input, {
                scale: 2,
                logging: true,
                useCORS: true,
                windowWidth: 1400 // Ensure wider capture for charts
            });
            console.log("Canvas captured");

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('financial-report.pdf');
            console.log("PDF saved");
        } catch (err) {
            console.error("Error generating PDF", err);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div className="font-sans min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Financial Analysis Dashboard</h1>
                    <button
                        onClick={handleDownloadPDF}
                        className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center shadow-lg shadow-[var(--color-primary)]/20 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Download Report
                    </button>
                </div>

                <div id="report-content" className="space-y-6 bg-transparent">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-panel p-6 border-none">
                            <p className="text-sm font-medium text-[var(--color-text-muted)]">Total Revenue</p>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                                <p className="text-2xl font-bold text-[var(--color-accent)] truncate">{formatCurrency(data?.totalRevenue || 0)}</p>
                                {data && (
                                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${data.revenueChange >= 0 ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                                        {data.revenueChange > 0 ? '+' : ''}{data.revenueChange.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="glass-panel p-6 border-none">
                            <p className="text-sm font-medium text-[var(--color-text-muted)]">Total Expense</p>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                                <p className="text-2xl font-bold text-[var(--color-danger)] truncate">{formatCurrency(data?.totalExpense || 0)}</p>
                                {data && (
                                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${data.expenseChange <= 0 ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                                        {data.expenseChange > 0 ? '+' : ''}{data.expenseChange.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="glass-panel p-6 border-none">
                            <p className="text-sm font-medium text-[var(--color-text-muted)]">Net Profit</p>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                                <p className={`text-2xl font-bold truncate ${data?.netProfit && data.netProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}`}>
                                    {formatCurrency(data?.netProfit || 0)}
                                </p>
                                {data && (
                                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${data.profitChange >= 0 ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                                        {data.profitChange > 0 ? '+' : ''}{data.profitChange.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="glass-panel p-6 border-none">
                            <p className="text-sm font-medium text-[var(--color-text-muted)]">Forecast Revenue (30 Days)</p>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                                <p className="text-2xl font-bold text-purple-400 truncate">{formatCurrency(data?.forecastRevenue || 0)}</p>
                                {data && (
                                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${data.growth >= 0 ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                                        {data.growth > 0 ? '+' : ''}{(data.growth || 0).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FinancialChart
                            lineData={data?.lineChartData || []}
                            pieData={data?.pieChartData || []}
                            barData={data?.barChartData || []}
                            type="trend"
                        />
                        <FinancialChart
                            lineData={data?.lineChartData || []}
                            pieData={data?.pieChartData || []}
                            barData={data?.barChartData || []}
                            type="monthly"
                        />
                        <FinancialChart
                            lineData={data?.lineChartData || []}
                            pieData={data?.pieChartData || []}
                            barData={data?.barChartData || []}
                            type="category"
                        />
                        <FinancialChart
                            lineData={data?.lineChartData || []}
                            pieData={data?.pieChartData || []}
                            barData={data?.barChartData || []}
                            type="composition"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
