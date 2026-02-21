const mongoose = require('mongoose');
require('dotenv').config();

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    type: { type: String, required: true } // 'income' or 'expense'
});

const Transaction = mongoose.model('transaction', transactionSchema);

const checkData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const count = await Transaction.countDocuments({});
        console.log(`Total Transactions: ${count}`);

        const transactions = await Transaction.find({ type: 'revenue' }).sort({ date: 1 });
        console.log(`Revenue Transactions: ${transactions.length}`);

        if (transactions.length > 0) {
            const dates = transactions.map(t => t.date.toISOString().split('T')[0]);
            console.log("Revenue Dates:", dates);

            const uniqueDays = new Set(dates);
            console.log(`Unique Revenue Days: ${uniqueDays.size}`);
        } else {
            console.log("No revenue transactions found.");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
