const fs = require('fs');

function applyHotPatch(absoluteFilePath, newCode) {
    try {
        console.log(`\n Hot-Patch Overwritting files at: ${absoluteFilePath}`);

        // overwreite broken files
        fs.writeFileSync(absoluteFilePath, newCode, 'utf8');

        // find exact memory address in node's cache
        const resolvedPath = require.resolve(absoluteFilePath);

        // delete the old code from active memory
        delete require.cache[resolvedPath];
        console.log(`Hot-Patch Memory cache busted for: ${resolvedPath}`);

        // force node to re-load the file into memory
        const freshlyPatchedModule = require(resolvedPath);
        return freshlyPatchedModule;

    } catch (error) {
        console.error('Patch failed', error);
    }
}

module.exports = { applyHotPatch };