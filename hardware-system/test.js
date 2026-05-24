const assert = require('assert');
const HardwareSystem = require('./index');

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  return { response, data };
}

async function main() {
  const system = new HardwareSystem();
  const initialized = await system.initialize();

  assert.equal(initialized, true);

  system.start();

  const baseUrl = 'http://127.0.0.1:3002';

  const health = await requestJson(`${baseUrl}/api/health`);
  assert.equal(health.response.ok, true);
  assert.equal(health.data.status, 'ok');

  const state = await requestJson(`${baseUrl}/api/hardware/state`);
  assert.equal(state.response.ok, true);
  assert.equal(state.data.state, 'IDLE');

  const changed = await requestJson(`${baseUrl}/api/hardware/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'CHARGING' })
  });
  assert.equal(changed.response.ok, true);
  assert.equal(changed.data.success, true);

  const data = await requestJson(`${baseUrl}/api/hardware/data`);
  assert.equal(data.response.ok, true);
  assert.equal(data.data.state, 'CHARGING');

  const reset = await requestJson(`${baseUrl}/api/hardware/reset`, {
    method: 'POST'
  });
  assert.equal(reset.response.ok, true);
  assert.equal(reset.data.success, true);

  await system.shutdown();
  console.log('Hardware system tests passed');
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});