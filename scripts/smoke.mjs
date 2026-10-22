import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { crearServidor } = require('../dist/server.js');
const servidor = crearServidor();
await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));

try {
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const salud = await (await fetch(`${base}/api/health`)).json();
  const pagina = await fetch(base);
  assert.equal(salud.estado, 'ok');
  assert.equal(pagina.status, 200);
  console.log('Smoke test: API y página web funcionan.');
} finally {
  await new Promise((resolve) => servidor.close(resolve));
}
