require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function run() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("AVAILABLE MODELS:", data.models.map(m => m.name).filter(name => name.includes('flash')));
    } catch(e) {
        console.error(e);
    }
}
run();
