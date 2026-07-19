const autocannon = require('autocannon');

console.log("[ARTILLERY] Firing continuously. Press CTRL+C to stop...");

// These exactly match the base routes defined in your server.js
const targetRoutes = [
    { method: 'GET', path: '/api/workforce/employee' },
    { method: 'GET', path: '/api/workforce/attendance' },
    { method: 'GET', path: '/api/inventory' },
    { method: 'GET', path: '/api/workforce/holidays' },
    { method: 'GET', path: '/api/dashboard' },
    { method: 'GET', path: '/api/reports' },
    { method: 'GET', path: '/api/workforce/job-roles' }
];

const instance = autocannon({
    url: 'http://localhost:5000',
    connections: 200,
    duration: 999999, // Runs infinitely until you press CTRL+C
    requests: targetRoutes,
}, console.log);

autocannon.track(instance, { renderProgressBar: true });