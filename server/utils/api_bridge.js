const axios = require('axios');
require('dotenv').config();
const { performance } = require('perf_hooks');

console.log("[SYMBIOTE] Booting Groq API Bridge...");

async function getRepairPatch(brokenCode, errorMessage, contract, schemaContext = "") {
    const systemPrompt = `You are an automated code repair engine for a Node.js/Express/Mongoose environment. 
    You must output your fix strictly in JSON format. Do not use markdown backticks. Output ONLY the raw JSON object.
    CRITICAL RULES:
    1. NEVER use double awaits in Mongoose queries (e.g., do NOT write 'await (await Model.find())').
    2. Write highly defensive code. Always assume req.body, req.query, or nested properties might be undefined.`;;
    
    const userPrompt = `
    Fix the following Node.js function. 
    
    Format required:
    {
        "status": "success",
        "patchedFunction": "The FULL corrected function, keeping its exact original name and declaration style (e.g., const myFunction = async (req, res, next) => { ... })"
    }
    
    Error: ${errorMessage}
    Contract: ${contract}

    Database Schemas for Context:
    ${schemaContext || "No schemas detected."}
    
    Code:
    ${brokenCode}
    `;

    try {
        const startTime = performance.now();

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.1-8b-instant", // Upgraded to 3.1
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const endTime = performance.now();
        const latencyMs = (endTime - startTime).toFixed(2);

        console.log(`\n[BENCHMARCK] Groq LPU synthesized patch in ${latencyMs} ms.`);

        const jsonResponse = JSON.parse(response.data.choices[0].message.content);
        return jsonResponse.patchedFunction;

    } catch (error) {
        console.error(`\n[GROQ API REJECTION]`, error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { getRepairPatch };