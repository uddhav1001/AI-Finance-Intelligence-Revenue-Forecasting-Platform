const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String, // 'revenue' or 'expense'
        required: true,
        enum: ['revenue', 'expense']
    },
    amount: {
        type: Number
    },
    category: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank', 'UPI', 'Card']
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Create index to optimize finding user transactions sorted by most recent date
TransactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
