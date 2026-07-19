const fs = require('fs');
const path = require('path');

const controllerDir = path.join(__dirname, 'server/controllers');
let controllerFiles = [];
const fileBackups = new Map();

// scan and map the entire controllers directory recrusively
function mapControllers(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            mapControllers(fullPath);
        } else if (fullPath.endsWith('.js')) {
            controllerFiles.push(fullPath);
            fileBackups.set(fullPath, fs.readFileSync(fullPath, 'utf8'));
        }
    }
}
mapControllers(controllerDir);
console.log(`[CHAOS Mapped ${controllerFiles.length} controller files]`);

// generic mutations that will break the controllers
const anomalies = [
    { search: "req.body", replace: "req.fakeBodyPayload" }, // cause undefined data
    { search: "res.status(200", replace: "res.fakeStatus(200" }, // cause typerror
    { search: "find(", replace: "find_BROKEN(" }, // cause db query failure
    { search: "req.params", replace: "req.params_NULL" }, // braks id lokups
];

let currentVictimPath = null;

function unleashChaos() {
    // if a file is currently broken, restore it first
    if (currentVictimPath) {
        console.log(`[CHAOS MONKEY] Restoring previous one: ${path.basename(currentVictimPath)}`);
        fs.writeFileSync(currentVictimPath, fileBackups.get(currentVictimPath), 'utf8');
    }

    // pick a random controller file to break
    currentVictimPath = controllerFiles[Math.floor(Math.random() * controllerFiles.length)];
    const healthyCode = fileBackups.get(currentVictimPath);
    const anomaly = anomalies[Math.floor(Math.random() * anomalies.length)];

    // only apply the anomaly if the healthy code contains the search string
    if (healthyCode.includes(anomaly.search)) {
        console.log(`\n[CHAOS MONKEY Striking file: ${path.basename(currentVictimPath)}]`);
        console.log(`[CHAOS MONKEY] Injecting Fault: Changing "${anomaly.search}" to "${anomaly.replace}"`);

        const brokenCode = healthyCode.replace(anomaly.search, anomaly.replace);
        fs.writeFileSync(currentVictimPath, brokenCode, 'utf8');

        console.log(`[CHAOS MONKEY] Awaiting Omni-Cannon trigger...`);
    } else {
        currentVictimPath = null;
        setTimeout(unleashChaos, 100);
        return;
    }

    setTimeout(unleashChaos, 10000);
}

// start the attack cycle
setTimeout(unleashChaos, 3000);

// failesafe: restore everything if the process is terminated
process.on('SIGINT', () => {
    console.log("\n[CHAOS MONKEY] Restoring all controller files...");
    for (const [filePath, healthyCode] of fileBackups.entries()) {
        fs.writeFileSync(filePath, healthyCode, 'utf8');
    }
    process.exit();
});