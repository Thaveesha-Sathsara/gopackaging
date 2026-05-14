const fs = require('fs');
const vm = require('vm');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

console.log("[EVOLUTION ENGINE] Reading broken DNA...");
const code = fs.readFileSync('./broken.js', 'utf8');

const ast = parser.parse(code, { sourceType: "module" });

let mutatedCode = "";

// Mutate the DNA
traverse(ast, {
    BinaryExpression(path) {
        if (path.node.operator === '<') {
            console.log(`[SURGERY] Flipping '<' to '<='...`);
            path.node.operator = '<=';
        }
    }
});

mutatedCode = generate(ast, {}, code).code;
console.log("\n[NEW DNA GENERATED]:");
console.log(mutatedCode);

// The fiteness fucntion (Sandbox test)
console.log("\n[TESTING IN SANDBOX] Injecting stock = 0...");

try {
    // Create a safe isolated environment
    const sandbox = {};
    vm.createContext(sandbox);

    // Load the mutated code into the sandbox
    const codeToRun = `${mutatedCode}\ncheckStock(0);`;
    const script = new vm.Script(codeToRun);

    const result = script.runInContext(sandbox);

    if (result === "Out of stock") {
        console.log(`[FITNESS PASSED] The mutated successfully fixed the logic! Resukt: ${result}`);
    } else {
        console.log(`[FITNESS FAILED] The mutated did not fix the logic. Result: ${result}`);
    }
} catch (error) {
    console.log(`[SANDBOX ERROR] An error occurred during sandbox execution: ${error.message}`);
}