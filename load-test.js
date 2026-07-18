const autocannon = require('autocannon');

console.log("[ARTILLERY] Starting load test...");

const instance = autocannon({
    url: 'http://localhost:5000/api/dashbaord.stats',
    connection: 500,
    duration: 60,
    pipelining: 10,
}, console.log);

autocannon.track(instance, { renderProgressBar: true });

instane.on('done', (result) => {
    console.log("[ARTILLERY] Load test completed!");
    console.log(`Total Requests Sent: ${result.requests.total}`);
    console.log(`Errors/Timeouts: ${result.errors + result.timeouts}`);
});