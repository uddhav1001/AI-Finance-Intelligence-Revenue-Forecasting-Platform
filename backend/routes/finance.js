const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

const upload = require('../middleware/upload');

// @route   POST api/finance/transaction
// @desc    Add a transaction (Revenue/Expense)
router.post('/transaction', [auth, upload.single('invoice')], async (req, res) => {
    try {
        const { type, amount, category, paymentMethod, description, date } = req.body;

        let fileUrl = '';
        if (req.file) {
            fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
        }

        const newTransaction = new Transaction({
            user: req.user.id,
            type,
            amount,
            category,
            paymentMethod,
            description,
            date,
            fileUrl
        });
        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/finance/transactions
// @desc    Get all transactions for user
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/finance/invoice
// @desc    Create an invoice
router.post('/invoice', auth, async (req, res) => {
    try {
        const { clientName, amount, items, dueDate } = req.body;
        const newInvoice = new Invoice({
            user: req.user.id,
            clientName,
            amount,
            items,
            dueDate
        });
        const invoice = await newInvoice.save();
        res.json(invoice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/finance/invoices
// @desc    Get all invoices
router.get('/invoices', auth, async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.user.id }).sort({ date: -1 });
        res.json(invoices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/finance/report/pdf
// @desc    Generate PDF Report of Financials
router.get('/report/pdf', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=financial_report.pdf');

        doc.pipe(res);

        doc.fontSize(25).text('Financial Report', { align: 'center' });
        doc.moveDown();

        transactions.forEach(t => {
            doc.fontSize(12).text(
                `${new Date(t.date).toLocaleDateString()} - ${t.type.toUpperCase()}: $${t.amount} (${t.category})`,
                { align: 'left' }
            );
        });

        doc.end();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/finance/transaction/:id
// @desc    Delete a transaction
router.delete('/transaction/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        // Check user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await transaction.deleteOne();

        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Transaction not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/finance/transaction/:id
// @desc    Update a transaction
router.put('/transaction/:id', auth, async (req, res) => {
    try {
        const { type, amount, category, paymentMethod, description, date } = req.body;

        // Build transaction object
        const transactionFields = {};
        if (type) transactionFields.type = type;
        if (amount) transactionFields.amount = amount;
        if (category) transactionFields.category = category;
        if (paymentMethod) transactionFields.paymentMethod = paymentMethod;
        if (description) transactionFields.description = description;
        if (date) transactionFields.date = date;

        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        // Check user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { $set: transactionFields },
            { new: true }
        );

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Transaction not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
