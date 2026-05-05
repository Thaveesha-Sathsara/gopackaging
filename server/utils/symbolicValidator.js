const acorn = require('acorn');
const walk = require('acorn-walk');

function validateAST(aiRawCode) {
    try {
        console.log(`\n[BOUNCER] Constructing AST for AI proposal...`);

        // Syntax check
        // If the AI hallucinates bad syntax or gets cut off, this throws instantly
        const ast = acorn.parse(aiRawCode, {
            ecmaVersion: 2022,
            sourceType: 'module'
        });

        let isSafe = true;
        let rejectionReason = "";

        console.log(`[BOUNCER] Traversing syntax tree for security violations...`);

        // Deep destructive scan
        walk.simple(ast, {
            // Look at every function call the AI tries to make
            CallExpression(node) {
                if (node.callee.name === 'require' && node.arguments.length > 0) {
                    const importedModule = node.arguments[0].value;
                    const forbiddenModules = ['fs', 'child_process', 'os', 'http'];

                    if (forbiddenModules.includes(importedModule)) {
                        isSafe = false;
                        rejectionReason = `Unauthorized module import attempted: '${importedModule}'`;
                    }
                }
            },
            // Look at every object property the AI tries to access
            MemberExpression(node) {
                if (node.object.name === 'process') {
                    isSafe = false;
                    rejectionReason = `Unauthorized access to global 'process.${node.property.name}'`;
                }
            }
        });

        if (isSafe) {
            console.log(`[BOUNCER] AST Validation passed. Code is secure.`);
            return aiRawCode;
        } else {
            console.error(`[BOUNCER FETAL] Security violation: ${rejectionReason}`);
            return null;
        }
    } catch (syntaxError) {
        console.error(`[BOUNCER FETAL] AI Generated invalid syntax: ${syntaxError.message}`);
        return null;
    }
}

module.exports = { validateAST };