const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularResumen, crearCarrito } = require('../dist/tienda.js');

test('carrito vacío comienza en cero', () => {
  assert.deepEqual(crearCarrito().ver(), {
    items: [], cupon: '', subtotal: 0, descuento: 0, envio: 0, total: 0,
  });
});

test('agregar productos calcula subtotal y envío', () => {
  const carrito = crearCarrito();
  carrito.agregar('cuaderno', 2);
  assert.equal(carrito.ver().subtotal, 25);
  assert.equal(carrito.ver().envio, 10);
  assert.equal(carrito.ver().total, 35);
});

test('envío es gratis desde Bs 100', () => {
  const carrito = crearCarrito();
  carrito.agregar('mochila', 1);
  carrito.agregar('lapices', 1);
  assert.equal(carrito.ver().subtotal, 109);
  assert.equal(carrito.ver().envio, 0);
});

test('cupón AHORRA10 descuenta diez por ciento', () => {
  const carrito = crearCarrito();
  carrito.agregar('mochila', 1);
  carrito.aplicarCupon('AHORRA10');
  assert.equal(carrito.ver().descuento, 8.5);
  assert.equal(carrito.ver().total, 86.5);
});

test('calcularResumen redondea centavos', () => {
  const resumen = calcularResumen([{ precio: 12.5, cantidad: 3 }], 'AHORRA10');
  assert.equal(resumen.descuento, 3.75);
  assert.equal(resumen.total, 43.75);
});

test('rechaza productos, cantidades y cupones inválidos', () => {
  const carrito = crearCarrito();
  assert.throws(() => carrito.agregar('falso'), /no encontrado/);
  assert.throws(() => carrito.agregar('cuaderno', 0), /cantidad/);
  assert.throws(() => carrito.aplicarCupon('OTRO'), /inválido/);
});

test('quitar y vaciar actualizan el estado', () => {
  const carrito = crearCarrito();
  carrito.agregar('cuaderno');
  carrito.agregar('botella');
  carrito.quitar('cuaderno');
  assert.equal(carrito.ver().items.length, 1);
  assert.equal(carrito.vaciar().items.length, 0);
});
