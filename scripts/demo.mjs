import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/calculadora.js';
const cliPath = 'src/cli.js';
const correct = '  return a + b;';
const broken = '  return a - b;';
const mode = process.argv[2];
const before = readFileSync(path, 'utf8');
const cliBefore = readFileSync(cliPath, 'utf8');
const originalOutput = 'console.log(`${a} + ${b} = ${sumar(a, b)}`);';
const improvedOutput = 'console.log(`Resultado: ${a} + ${b} = ${sumar(a, b)}`);';

if (mode === 'success' && cliBefore.includes(originalOutput)) {
  writeFileSync(cliPath, cliBefore.replace(originalOutput, improvedOutput));
  console.log('Cambio correcto: la CLI muestra una etiqueta antes del resultado.');
} else if (mode === 'fail' && before.includes(correct)) {
  writeFileSync(path, before.replace(correct, broken));
  console.log('Fallo introducido: sumar ahora resta. Revisa git diff antes de publicar.');
} else if (mode === 'fix' && before.includes(broken)) {
  writeFileSync(path, before.replace(broken, correct));
  console.log('Función corregida: sumar vuelve a sumar.');
} else {
  console.error(`No se hizo ningún cambio. Estado o modo inesperado: ${mode ?? '(vacío)'}`);
  process.exitCode = 1;
}

