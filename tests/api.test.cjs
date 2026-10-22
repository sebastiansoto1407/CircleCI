const test = require('node:test');
const assert = require('node:assert/strict');
const { crearServidor } = require('../dist/server.js');

async function conServidor(prueba) {
  const servidor = crearServidor();
  await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  try { await prueba(base); } finally { await new Promise((resolve) => servidor.close(resolve)); }
}

test('API responde a salud y catálogo', async () => {
  await conServidor(async (base) => {
    const salud = await (await fetch(`${base}/api/health`)).json();
    const productos = await (await fetch(`${base}/api/productos`)).json();
    assert.equal(salud.estado, 'ok');
    assert.equal(productos.length, 4);
  });
});

test('API agrega un producto y devuelve el carrito', async () => {
  await conServidor(async (base) => {
    const respuesta = await fetch(`${base}/api/carrito`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'cuaderno', cantidad: 2 }),
    });
    assert.equal(respuesta.status, 201);
    assert.equal((await respuesta.json()).total, 35);
    assert.equal((await (await fetch(`${base}/api/carrito`)).json()).items.length, 1);
  });
});

test('API rechaza un producto inexistente', async () => {
  await conServidor(async (base) => {
    const respuesta = await fetch(`${base}/api/carrito`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'inexistente' }),
    });
    assert.equal(respuesta.status, 400);
    assert.match((await respuesta.json()).error, /no encontrado/);
  });
});

test('servidor entrega la página principal', async () => {
  await conServidor(async (base) => {
    const respuesta = await fetch(base);
    assert.equal(respuesta.status, 200);
    assert.match(await respuesta.text(), /Mini tienda/);
  });
});
