const axios = require('axios');
const { performance } = require('perf_hooks');

console.log("[SYMBIOTE] Booting Local Tensor Bridge...");

async function getLatentRepair(brokenCode, errorMessage) {
    try {
        const startTime = performance.now();

        const response = await axios.post('http://127.0.0.1:5050/diagnose', {
            brokenCode: brokenCode,
            errorMessage: errorMessage
        });

        const endTime = performance.now();
        const latencyMs = (endTime - startTime).toFixed(2);

        console.log(`\n[TENSOR BENCHMARK] Latent space diagnostic complete in ${latencyMs} ms.`);
        console.log(`[TOPOLOGY MATCH] Closest stable node: ${response.data.closet_manifold_node}`);

        return response.data.healed_code;
        
    } catch (error) {
        console.error(`\n[TENSOR REJECTION]`, error.message);
        throw error;
    }
}

module.exports = { getLatentRepair };