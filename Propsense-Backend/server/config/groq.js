import Groq from 'groq-sdk';
import dotenv from "dotenv"
dotenv.config()


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default groq;


// export const getEmbedding = async (text) => {
//     const response = await fetch(
//         'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
//         {
//             method: 'POST',
//             headers: {
//                 Authorization: `Bearer ${process.env.HF_API_KEY}`,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ inputs: text }),
//         }
//     );

//     const textResponse = await response.text();
//     console.log("RAW HF RESPONSE:", textResponse);

//     // 🔁 handle model loading
//     if (textResponse.includes("loading")) {
//         console.log("Model loading, retrying in 5s...");
//         await new Promise(res => setTimeout(res, 5000));
//         return getEmbedding(text);
//     }

//     if (!response.ok) {
//         throw new Error(`HF API Error: ${textResponse}`);
//     }

//     try {
//         const data = JSON.parse(textResponse);
//         return Array.isArray(data[0]) ? data[0] : data;
//     } catch {
//         throw new Error(`HF returned invalid JSON: ${textResponse}`);
//     }
// };

import { pipeline } from '@xenova/transformers';

let extractor;

export const getEmbedding = async (text) => {
    if (!extractor) {
        extractor = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2'
        );
    }

    const output = await extractor(text, {
        pooling: 'mean',
        normalize: true,
    });

    return Array.from(output.data);
};