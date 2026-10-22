import { sumar } from './calculadora.js';

const a = Number(process.argv[2]);
const b = Number(process.argv[3]);

if (!Number.isFinite(a) || !Number.isFinite(b)) {
  console.error('Uso: node dist/cli.js <numero1> <numero2>');
  process.exitCode = 1;
} else {
  console.log(`${a} + ${b} = ${sumar(a, b)}`);
}

