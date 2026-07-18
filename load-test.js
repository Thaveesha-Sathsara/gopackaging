const autocannon = require('autocannon');

console.log("[ARTILLERY] Spinning up Omni-Cannon to blanket the API...");

const targetRoutes = [
    { method: 'GET', path: '/api/dashboard' },
    { method: 'GET', path: '/api/workforce/employee' },
    { method: 'GET', path: '/api/inventory' },
    { method: 'GET', path: '/api/workforce/holidays' },
    { method: 'GET', path: '/api/workforce/attendance' },
    { method: 'GET', path: '/api/workforce/payroll' },
];

const instance = autocannon({
    url: 'http://localhost:5000',
    connections: 200,
    duration: 60, 
    requests: targetRoutes, // cycles through all routes randomly
}, console.log);

autocannon.track(instance, { renderProgressBar: true });

instance.on('done', (result) => {
    console.log(`\n[BOMBARDMENT COMPLETE]`);
    console.log(`Total Requests Sent: ${result.requests.total}`);
    console.log(`Errors/Timeouts: ${result.errors + result.timeouts}`);
});