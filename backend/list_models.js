const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.log("No GEMINI_API_KEY found in .env");
        return;
    }

    try {
        // Fetch the list of models via REST API since the SDK listModels might be tricky to run standalone quickly
        // Actually SDK is easier if it works
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
