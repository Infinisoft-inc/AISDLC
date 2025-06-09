# Test Results Idle State Injection

found 0 vulnerabilities
agent2@WINDOWS:~/AISDLC/experiments/mcp-realtime-injection/test-scripts$ npm run test:idle

> mcp-realtime-test-scripts@211.0.0 test:idle
> node test-runner.js scenario IDLE_STATE

🚀 Starting Single Scenario Test
============================================================

🧪 Starting: Idle State Injection
📝 Description: Send messages when agent is not actively responding
⏱️  Delay: 1000ms, Messages: 3
🆔 Conversation ID: test-1749222256852-2x5abf05k
────────────────────────────────────────────────────────────
Error inserting message: {
  message: 'TypeError: fetch failed',
  details: 'TypeError: fetch failed\n' +
    '    at node:internal/deps/undici/undici:13510:13\n' +
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n' +
    '    at async TestRunner.insertMessage (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:97:29)\n' +
    '    at async TestRunner.runScenario (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:172:25)\n' +
    '    at async TestRunner.runSingleScenario (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:248:5)\n' +
    '    at async main (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:298:7)',
  hint: '',
  code: ''
}
Error inserting message: {
  message: 'TypeError: fetch failed',
  details: 'TypeError: fetch failed\n' +
    '    at node:internal/deps/undici/undici:13510:13\n' +
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n' +
    '    at async TestRunner.insertMessage (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:97:29)\n' +
    '    at async TestRunner.runScenario (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:172:25)\n' +
    '    at async TestRunner.runSingleScenario (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:248:5)\n' +
    '    at async main (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:298:7)',
  hint: '',
  code: ''
}
Error inserting message: {
  message: 'TypeError: fetch failed',
  details: 'TypeError: fetch failed\n' +
    '    at node:internal/deps/undici/undici:13510:13\n' +
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n' +
    '    at async TestRunner.insertMessage (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:97:29)\n' +
    '    at async TestRunner.runScenario (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:172:25)\n' +
    '    at async TestRunner.runSingleScenario (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:248:5)\n' +
    '    at async main (file:///home/agent2/AISDLC/experiments/mcp-realtime-injection/test-scripts/test-runner.js:298:7)',
  hint: '',
  code: ''
}
✅ Completed: Idle State Injection
📊 Messages inserted: 0
⏱️  Duration: 2084ms

📊 TEST SUMMARY
============================================================
✅ Successful scenarios: 1
❌ Failed scenarios: 0
📈 Total scenarios: 1

📋 Detailed Results:
✅ Idle State Injection (IDLE_STATE)
   📊 0 messages in 2084ms
   🆔 Conversation: test-1749222256852-2x5abf05k

🔬 Experiment completed. Check Augment Code behavior for analysis.
agent2@WINDOWS:~/AISDLC/experiments/mcp-realtime-injection/test-scripts$ 