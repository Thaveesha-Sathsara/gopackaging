const path = require('path');

const hotProxy = (controllerRelativePath, methodName) => {
    return (req, res, next) => {
        // 1. Resolve absolute path
        const absolutePath = require.resolve(path.join(__dirname, '../controllers', controllerRelativePath));
        
        // 2. Murder the ghost cache
        delete require.cache[absolutePath]; 
        
        // 3. Load fresh file dynamically
        const controller = require(absolutePath);
        return controller[methodName](req, res, next);
    };
};

module.exports = { hotProxy };