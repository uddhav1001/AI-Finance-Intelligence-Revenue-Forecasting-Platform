const router = require('express').Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { spawn } = require('child_process');
const path = require('path');

// Helper to run Python Forecast Script
const getForecast = (transactions) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'scripts', 'forecast_revenue.py');

        // Group transactions by date and calculate net profit (revenue - expense) for that day
        const dailyNetMap = {};
        transactions.forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString('en-CA');
            if (!dailyNetMap[dateStr]) {
                dailyNetMap[dateStr] = 0;
            }
            if (t.type === 'revenue') {
                dailyNetMap[dateStr] += (t.amount || 0);
            } else if (t.type === 'expense') {
                dailyNetMap[dateStr] -= (t.amount || 0);
            }
        });

        const netData = Object.keys(dailyNetMap).map(date => ({
            date: date,
            amount: dailyNetMap[date]
        }));

        if (netData.length < 2) {
            return resolve([]);
        }

        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`); // Debug log
            if (code !== 0) {
                console.error(`Forecast process exited with code ${code}`);
                resolve([]);
                return;
            }
            try {
                console.log(`Python Output: ${dataString.substring(0, 100)}...`); // Debug log (truncated)
                const result = JSON.parse(dataString);
                if (result.error) {
                    resolve([]);
                } else {
                    resolve(result);
                }
            } catch (e) {
                console.error("Failed to parse forecast output");
                resolve([]);
            }
        });

        pythonProcess.stdin.write(JSON.stringify(netData));
        pythonProcess.stdin.end();

        pythonProcess.on('error', (err) => {
            console.error("Failed to spawn python:", err);
            resolve([]);
        });
    });
};

// @route   GET api/dashboard
// @desc    Get dashboard data (Revenue, Expense, Profit, Forecast, Insights)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });

        let totalRevenue = 0;
        let totalExpense = 0;
        let netProfitTrend = []; // To calculate forecast or trend

        let pieChartData = {};
        let lineChartData = {};
        let barChartData = {}; // Monthly Aggregation

        transactions.forEach(transaction => {
            const dateStr = new Date(transaction.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
            if (!lineChartData[dateStr]) {
                lineChartData[dateStr] = { date: dateStr, revenue: 0, expense: 0 };
            }

            const amt = transaction.amount || 0;

            if (transaction.type === 'revenue') {
                totalRevenue += amt;
                lineChartData[dateStr].revenue += amt;

                // Bar Chart Data (Monthly)
                const monthStr = dateStr.substring(0, 7); // YYYY-MM
                if (!barChartData[monthStr]) {
                    barChartData[monthStr] = { month: monthStr, revenue: 0, expense: 0 };
                }
                barChartData[monthStr].revenue += amt;
            } else if (transaction.type === 'expense') {
                totalExpense += amt;
                lineChartData[dateStr].expense += amt;

                // Bar Chart Data (Monthly)
                const monthStr = dateStr.substring(0, 7); // YYYY-MM
                if (!barChartData[monthStr]) {
                    barChartData[monthStr] = { month: monthStr, revenue: 0, expense: 0 };
                }
                barChartData[monthStr].expense += amt;

                // Pie Chart Data (Expenses by Category)
                if (pieChartData[transaction.category]) {
                    pieChartData[transaction.category] += amt;
                } else {
                    pieChartData[transaction.category] = amt;
                }
            }
        });

        // Build netProfitTrend for fallback forecasting
        Object.keys(lineChartData).forEach(dateStr => {
            netProfitTrend.push({
                date: dateStr,
                amount: lineChartData[dateStr].revenue - lineChartData[dateStr].expense
            });
        });

        // Convert objects to arrays for charts
        const pieChartArray = Object.keys(pieChartData).map(key => ({
            name: key,
            value: pieChartData[key]
        }));

        const lineChartArray = Object.values(lineChartData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const barChartArray = Object.values(barChartData).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        const netProfit = totalRevenue - totalExpense;

        // Forecast Logic (Prophet)
        const forecastData = await getForecast(transactions);
        let forecastRevenue = 0;
        let trend = 'stable';
        let growth = 0;

        if (forecastData.length > 0) {
            // Sum of next 30 days predicted revenue
            forecastRevenue = forecastData.reduce((acc, curr) => acc + curr.forecast, 0);

            // Determine Trend (compare first and last few days of forecast)
            const firstDays = forecastData.slice(0, 5).reduce((a, b) => a + b.forecast, 0);
            const lastDays = forecastData.slice(-5).reduce((a, b) => a + b.forecast, 0);

            if (lastDays > firstDays * 1.02) trend = 'upward';
            else if (lastDays < firstDays * 0.98) trend = 'downward';

        } else {
            console.log("Entering Forecast Fallback Logic"); // Debug log area 
            // Fallback: Simple projection based on daily average
            if (netProfitTrend.length > 0) {
                const totalNetProfitForTrend = netProfitTrend.reduce((acc, curr) => acc + curr.amount, 0);

                // Calculate span of days
                const sortedDates = netProfitTrend.map(t => new Date(t.date).getTime()).sort((a, b) => a - b);
                const firstDate = sortedDates[0];
                const lastDate = sortedDates[sortedDates.length - 1];

                // Avoid division by zero or overly aggressive daily avg for single day
                // If 1 day: span = 1.
                const diffDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
                const daySpan = diffDays < 1 ? 1 : diffDays + 1;

                console.log(`Fallback: TotalNetProfit=${totalNetProfitForTrend}, Span=${daySpan}`);

                const dailyAvg = totalNetProfitForTrend / daySpan;
                forecastRevenue = dailyAvg * 30; // Project next 30 days

                // Generate 30 days of data points for chart
                const lastDateObj = new Date(lastDate);
                for (let i = 1; i <= 30; i++) {
                    const nextDate = new Date(lastDateObj);
                    nextDate.setDate(lastDateObj.getDate() + i);
                    forecastData.push({
                        date: nextDate.toISOString().split('T')[0],
                        forecast: parseFloat(dailyAvg.toFixed(2)),
                        lower: parseFloat((dailyAvg * 0.9).toFixed(2)),
                        upper: parseFloat((dailyAvg * 1.1).toFixed(2)),
                        trend: 'stable'
                    });
                }
                trend = 'stable';
            } else {
                forecastRevenue = 0;
                console.log("Fallback: No net profit trend data found.");
            }
        }

        // Calculate Growth vs Last Month (Applies to both Prophet and Fallback)
        const sortedMonths = Object.keys(barChartData).sort();
        const lastMonthKey = sortedMonths[sortedMonths.length - 1];
        const lastMonthRevenue = lastMonthKey ? barChartData[lastMonthKey].revenue : 0;

        if (lastMonthRevenue > 0) {
            growth = ((forecastRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        }

        // Calculate Month-over-Month Changes for Cards
        const currentDateStr = new Date().toLocaleDateString('en-CA');
        const currentMonthStr = currentDateStr.substring(0, 7);

        let prevDate = new Date();
        prevDate.setMonth(prevDate.getMonth() - 1);
        const previousMonthStr = prevDate.toLocaleDateString('en-CA').substring(0, 7);

        const currentMonthRev = barChartData[currentMonthStr]?.revenue || 0;
        const previousMonthRev = barChartData[previousMonthStr]?.revenue || 0;
        let revenueChange = 0;
        if (previousMonthRev === 0) {
            revenueChange = currentMonthRev > 0 ? 100 : 0;
        } else {
            revenueChange = ((currentMonthRev - previousMonthRev) / previousMonthRev) * 100;
        }
        // Cap between -100 and 100
        revenueChange = Math.max(-100, Math.min(100, revenueChange));

        const currentMonthExp = barChartData[currentMonthStr]?.expense || 0;
        const previousMonthExp = barChartData[previousMonthStr]?.expense || 0;
        let expenseChange = 0;
        if (previousMonthExp === 0) {
            expenseChange = currentMonthExp > 0 ? 100 : 0;
        } else {
            expenseChange = ((currentMonthExp - previousMonthExp) / previousMonthExp) * 100;
        }
        // Cap between -100 and 100
        expenseChange = Math.max(-100, Math.min(100, expenseChange));

        const currentMonthProfit = currentMonthRev - currentMonthExp;
        const previousMonthProfit = previousMonthRev - previousMonthExp;
        let profitChange = 0;
        if (previousMonthProfit === 0) {
            profitChange = currentMonthProfit > 0 ? 100 : (currentMonthProfit < 0 ? -100 : 0);
        } else {
            profitChange = ((currentMonthProfit - previousMonthProfit) / Math.abs(previousMonthProfit)) * 100;
        }
        // Cap between -100 and 100
        profitChange = Math.max(-100, Math.min(100, profitChange));

        // AI Insights (Rule-based or Mocked)
        const aiInsights = [
            {
                id: 1,
                title: 'Spending Pattern',
                message: totalExpense > totalRevenue ? 'High spending detected. Consider cutting costs.' : 'Healthy spending habits observed.',
                type: totalExpense > totalRevenue ? 'warning' : 'success'
            },
            {
                id: 2,
                title: 'Revenue Goal',
                message: `You are ${totalRevenue > 10000 ? 'on track' : 'behind'} to reach your monthly revenue goal using current trends.`,
                type: totalRevenue > 10000 ? 'success' : 'info'
            },
            {
                id: 3,
                title: 'Investment Opportunity',
                message: 'Consider reinvesting 20% of your net profit into marketing.',
                type: 'info'
            }
        ];

        res.json({
            totalRevenue,
            totalExpense,
            netProfit,
            forecastRevenue,
            forecastData, // Return the detailed forecast for charting
            trend,
            growth,
            revenueChange,
            expenseChange,
            profitChange,
            aiInsights,
            pieChartData: pieChartArray,
            lineChartData: lineChartArray,
            barChartData: barChartArray
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
