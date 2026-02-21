const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    items: [
        {
            description: String,
            quantity: Number,
            price: Number
        }
    ],
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Overdue']
    },
    dueDate: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
