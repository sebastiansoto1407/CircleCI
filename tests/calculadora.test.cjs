const test = require('node:test');
const assert = require('node:assert/strict');
const { sumar, restar } = require('../dist/calculadora.js');

test('sumar dos enteros positivos', () => {
  assert.equal(sumar(2, 3), 5);
});

test('sumar un número negativo', () => {
  assert.equal(sumar(-4, 6), 2);
});

test('sumar cero', () => {
  assert.equal(sumar(0, 7), 7);
});

test('restar dos enteros', () => {
  assert.equal(restar(8, 3), 5);
});

