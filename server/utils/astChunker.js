const acorn = require('acorn');
const walk = require('acorn-walk');

function extractBrokenFunction(sourceCode, errorStack) {
    try {
        console.log(`[CHUNKER] Scanning stack trace for exact line number...`);
        // Extract the line number from the node stack trace
        const match = errorStack.match(/:(\d+):\d+\)/) || errorStack.match(/:(\d+):\d+/);
        if (!match) return sourceCode;

        const errorLine = parseInt(match[1], 10);
        console.log(`[CHUNKER] Crach isolated at line ${error.line}. Extractioning function block...`);

        // Parse the code with location data enabled so can see the line numbers
        const ast = acorn.parse(sourceCode, { ecmaVersion: 2022, locations: true, sourceType: 'module' });

        let exactFunction = sourceCode;

        // Walk the tree looking for the specific function that contains the error line
        walk.ancestor(ast, {
            Function(node, ancestors) {
                if (node.loc.start.line <= errorLine && node.loc.end.line >= errorLine) {
                    const parent = ancestors[ancestors.length - 2];
                    if (parent && parent.type === 'VariableDeclarator') {
                        const grandParent = ancestors[ancestors.length - 3];
                        exactFunction = sourceCode.substring(grandParent.start, grandParent.end);
                    } else {
                        exactFunction = sourceCode.substring(node.start, node.end);
                    }
                }
            }
        });

        return exactFunction;
    } catch (e) {
        console.log(`[CHUNKER FAILED] Returning full file. Error: ${e.message}`);
        return sourceCode;
    }
}

module.exports = { extractBrokenFunction };