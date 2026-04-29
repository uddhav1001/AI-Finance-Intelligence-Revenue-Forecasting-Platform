const router = require('express').Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { GoogleGenAI } = require("@google/genai");
const upload = require('../middleware/upload');
const fs = require('fs');

// @route   POST api/ai/analyze
// @desc    Analyze transactions to provide insights or chat response
// @access  Private
router.post('/analyze', auth, async (req, res) => {
    try {
        const { query } = req.body; // User question (optional)

        // Fetch recent transactions for context
        // Limit to 50 to avoid token limits
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 }).limit(50);

        // --- Simple Rule-Based Insight (Fast Fallback) ---
        let insights = [];
        let totalExpense = 0;
        let categories = {};

        transactions.forEach(t => {
            if (t.type === 'expense') {
                totalExpense += t.amount;
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            }
        });

        // Logic 1: Identify Highest Spending Category
        let maxCategory = '';
        let maxVal = 0;
        for (const [cat, val] of Object.entries(categories)) {
            if (val > maxVal) {
                maxVal = val;
                maxCategory = cat;
            }
        }

        if (maxCategory) {
            insights.push({
                id: 1,
                title: 'Spending Alert',
                message: `Your highest spending category recently is ${maxCategory} ($${maxVal}). Consider setting a budget for this.`,
                type: 'warning'
            });
        }

        if (transactions.length > 0) {
            insights.push({
                id: 2,
                title: 'Activity Summary',
                message: `You have made ${transactions.length} transactions recently, totaling $${totalExpense} in expenses.`,
                type: 'info'
            });
        }

        // --- Gemini AI Integration ---
        let chatResponse = "";

        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

                // Prepare context
                const transactionContext = transactions.map(t =>
                    `${t.date.toISOString().split('T')[0]}: ${t.type} of $${t.amount} for ${t.category} (${t.description})`
                ).join('\n');

                let prompt = "";
                if (query) {
                    prompt = `You are an AI financial coach. The user asks: "${query}". 
                    Here is their recent transaction history:\n${transactionContext}\n
                    Answer the user's question based on this data. Be concise, helpful, and friendly.`;
                } else {
                    // If no query, generate a proactive insight
                    prompt = `You are an AI financial coach. Analyze the following transaction history:\n${transactionContext}\n
                    Provide one concise, valuable insight or tip for the user based on their spending patterns. Do not start with "Based on your transaction history". Just give the insight.`;
                }

                const response = await ai.models.generateContent({
                    model: "gemini-flash-lite-latest",
                    contents: prompt,
                });

                const text = response.text;

                if (query) {
                    chatResponse = text;
                } else {
                    // Check if we haven't already added too many insights
                    if (insights.length < 3) {
                        insights.push({
                            id: 3,
                            title: 'AI Coach Tip',
                            message: text,
                            type: 'info'
                        });
                    }
                }

            } catch (aiError) {
                console.error("Gemini API Error:", aiError.message);
                if (query) {
                    chatResponse = `Error: ${aiError.message}. Please check your server logs/API key.`;
                }
            }
        } else {
            // Fallback if no API key
            if (query) {
                const lowerQuery = query.toLowerCase();
                if (lowerQuery.includes('save')) {
                    chatResponse = `(Offline Mode) To save more, try reducing your spending on ${maxCategory || 'discretionary items'}.`;
                } else if (lowerQuery.includes('spend') || lowerQuery.includes('spent')) {
                    chatResponse = `(Offline Mode) You have spent a total of $${totalExpense} in your last ${transactions.length} transactions.`;
                } else {
                    chatResponse = "(Offline Mode) I can only answer basic questions without an API key. Add GEMINI_API_KEY to .env to unlock full power!";
                }
            }
        }

        res.json({ insights, chatResponse });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/ai/parse-invoice
// @desc    Parse an uploaded invoice and extract amount and store
// @access  Private
router.post('/parse-invoice', [auth, upload.single('invoice')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Gemini API Key missing' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Read file to base64
        const fileBytes = fs.readFileSync(req.file.path);
        const base64Data = Buffer.from(fileBytes).toString("base64");
        const mimeType = req.file.mimetype;

        const prompt = `You are a financial receipt parser. Analyze the provided image of an invoice/receipt.
Extract the "Grand Total" or "Total" amount, and the likely store or vendor name.
Respond ONLY with a valid JSON object in this exact format: {"amount": 123.45, "store": "Store Name"}. Do not use markdown blocks (\`\`\`).`;

        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: [
                prompt,
                { inlineData: { data: base64Data, mimeType } }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        let parsedData = {};
        
        try {
            parsedData = JSON.parse(text.trim());
        } catch (parseError) {
            console.error("JSON Parse Error on backend. Raw AI Text:", text);
            return res.status(500).json({ msg: 'Failed to parse AI response' });
        }

        res.json({
            amount: parsedData.amount,
            store: parsedData.store,
            fileUrl
        });

    } catch (err) {
        console.error("Invoice Parse Error:", err.message);
        res.status(500).send('Server Error during parsing');
    }
});

module.exports = router;
