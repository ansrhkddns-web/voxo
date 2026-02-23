import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

async function run() {
    const env = fs.readFileSync('.env.local', 'utf8');
    const key = env.match(/GEMINI_API_KEY=(.*)/)?.[1];

    if (!key) {
        console.error("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-latest']) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            console.log(`Success: ${modelName} -> ${result.response.text()}`);
        } catch (e) {
            console.error(`Failed ${modelName}:`, e.message);
        }
    }
}
run();
