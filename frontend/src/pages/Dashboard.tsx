import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import AIInsightsCard from '../components/AIInsightsCard';
import TransactionForm from '../components/TransactionForm';


// Icons (Simple SVGs or use a library like lucide-react or heroicons if available, standard SVG for now)
const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ExpenseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
);

const ProfitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
    </svg>
);

const ForecastIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);

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
}

const Dashboard = () => {
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

                // Attach token to request is handled by axios interceptor if set up, 
                // but checking Login.tsx it imports 'api' from '../api/axios', ensuring it's used.
                // Assuming api/axios handles headers or I need to set it.
                // Safest to set it if not global.
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="font-sans">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Revenue"
                        value={`₹${(data?.totalRevenue || 0).toLocaleString()}`}
                        trend={`${data?.revenueChange && data.revenueChange > 0 ? '+' : ''}${(data?.revenueChange || 0).toFixed(1)}%`}
                        trendUp={(data?.revenueChange || 0) >= 0}
                        icon={<RevenueIcon />}
                    />
                    <StatCard
                        title="Expense"
                        value={`₹${(data?.totalExpense || 0).toLocaleString()}`}
                        trend={`${data?.expenseChange && data.expenseChange > 0 ? '+' : ''}${(data?.expenseChange || 0).toFixed(1)}%`}
                        trendUp={(data?.expenseChange || 0) <= 0} // For expense, decreasing (<= 0) is good (green)
                        icon={<ExpenseIcon />}
                    />
                    <StatCard
                        title="Net Profit"
                        value={`₹${(data?.netProfit || 0).toLocaleString()}`}
                        trend={`${data?.profitChange && data.profitChange > 0 ? '+' : ''}${(data?.profitChange || 0).toFixed(1)}%`}
                        trendUp={(data?.profitChange || 0) >= 0}
                        icon={<ProfitIcon />}
                    />
                    <StatCard
                        title="Forecast Revenue"
                        value={`₹${(data?.forecastRevenue || 0).toLocaleString()}`}
                        trend={`${data?.growth && data.growth > 0 ? '+' : ''}${(data?.growth || 0).toFixed(1)}%`}
                        trendUp={(data?.growth || 0) >= 0}
                        icon={<ForecastIcon />}
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Charts/Tables - Placeholder for now) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Transaction Form */}
                        <div className="mb-8">
                            <TransactionForm onSuccess={() => {
                                setLoading(true);

                                api.get('/dashboard')
                                    .then(res => {
                                        setData(res.data);
                                        setLoading(false);
                                    })
                                    .catch(() => setLoading(false));
                            }} />
                        </div>

                        {/* Charts moved to Reports page */}
                    </div>

                    {/* Right Column (AI Insights) */}
                    <div className="lg:col-span-1">
                        <AIInsightsCard insights={data?.aiInsights || []} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
