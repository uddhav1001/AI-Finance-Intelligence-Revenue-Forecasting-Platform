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

module.exports = mongoose.model('Transaction', TransactionSchema);
