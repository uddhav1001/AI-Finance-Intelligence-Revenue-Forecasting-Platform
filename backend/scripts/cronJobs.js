const cron = require('node-cron');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendMonthlyReportEmail } = require('../utils/emailService');

// Calculates the basic financial summary for a user's transactions 
const calculateMonthlySummary = (transactions) => {
    let totalRevenue = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        const amt = t.amount || 0;
        if (t.type === 'revenue') totalRevenue += amt;
        else if (t.type === 'expense') totalExpense += amt;
    });

    const netProfit = totalRevenue - totalExpense;

    // Simple 30-day fallback forecast based on daily average
    let forecastRevenue = 0;
    if (transactions.length > 0) {
        // Find span of days
        const dates = transactions.map(t => new Date(t.date).getTime()).sort();
        const first = dates[0];
        const last = dates[dates.length - 1];
        const diffDays = (last - first) / (1000 * 60 * 60 * 24);
        const daySpan = diffDays < 1 ? 1 : diffDays;

        const dailyAvg = netProfit / daySpan;
        forecastRevenue = dailyAvg * 30;
    }

    // Generate basic AI insights based on the calculated totals
    const aiInsights = [
        {
            title: 'Spending Pattern',
            message: totalExpense > totalRevenue ? 'High spending detected this month. Try to cut non-essential costs.' : 'Great job! You spent less than you earned this month.',
        },
        {
            title: 'Savings Opportunity',
            message: netProfit > 0 ? `You saved ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(netProfit)}! Consider investing a portion of this.` : 'You operated at a loss this month. Review your categorical spending to find leaks.',
        }
    ];

    return { totalRevenue, totalExpense, netProfit, forecastRevenue, aiInsights };
};

// Main Job function
const runMonthlyEmailJob = async () => {
    console.log('[Cron] Starting Monthly Email Job...');

    try {
        const users = await User.find().select('-password');

        // Get dates for the last 30 days dynamically
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        for (const user of users) {
            // Only process users with an email address
            if (!user.email) continue;

            // Find transactions from the last month for this user
            const transactions = await Transaction.find({
                user: user._id,
                date: {
                    $gte: thirtyDaysAgo,
                    $lte: now
                }
            });

            // Even if they have no transactions, we might still want to remind them
            const summary = calculateMonthlySummary(transactions);

            const emailData = {
                username: user.username,
                ...summary
            };

            await sendMonthlyReportEmail(user.email, emailData);
        }

        console.log('[Cron] Finished Monthly Email Job.');
    } catch (error) {
        console.error('[Cron] Error running monthly email job:', error);
    }
};

// Initialize the scheduler
// "0 9 1 * *" runs at 09:00 AM on the 1st of every month
// For testing purposes, uncomment the second line to run every minute
const initCronJobs = () => {
    // cron.schedule('* * * * *', runMonthlyEmailJob); // <-- UNCOMMENT THIS LINE ONLY FOR TESTING
    cron.schedule('0 9 1 * *', runMonthlyEmailJob);
    console.log('Cron jobs initialized: Monthly Email scheduled for the 1st of every month at 9:00 AM');
};

module.exports = { initCronJobs, runMonthlyEmailJob };
