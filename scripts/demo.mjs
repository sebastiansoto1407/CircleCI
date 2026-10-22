import { readFileSync, writeFileSync } from 'node:fs';

const calculadora = 'src/calculadora.js';
const pagina = 'public/index.html';
const sumaCorrecta = '  return a + b;';
const sumaIncorrecta = '  return a - b;';
const textoOriginal = 'Agrega productos, aplica un cupón y revisa cómo se calcula el total.';
const textoNuevo = 'Agrega productos, aplica un cupón y observa el total al instante.';
const modo = process.argv[2];

if (modo === 'success') {
  const contenido = readFileSync(pagina, 'utf8');
  if (!contenido.includes(textoOriginal)) {
    console.error('El cambio correcto ya se aplicó o el texto de la página cambió.');
    process.exitCode = 1;
  } else {
    writeFileSync(pagina, contenido.replace(textoOriginal, textoNuevo));
    console.log('Cambio correcto: la página muestra un nuevo subtítulo.');
  }
} else if (modo === 'fail' || modo === 'fix') {
  const contenido = readFileSync(calculadora, 'utf8');
  const anterior = modo === 'fail' ? sumaCorrecta : sumaIncorrecta;
  const siguiente = modo === 'fail' ? sumaIncorrecta : sumaCorrecta;
  if (!contenido.includes(anterior)) {
    console.error(`No se hizo ningún cambio: estado inesperado para ${modo}.`);
    process.exitCode = 1;
  } else {
    writeFileSync(calculadora, contenido.replace(anterior, siguiente));
    console.log(modo === 'fail'
      ? 'Fallo introducido: sumar ahora resta. Revisa git diff antes de publicar.'
      : 'Función corregida: sumar vuelve a sumar.');
  }
} else {
  console.error('Uso: npm run demo:success, demo:fail o demo:fix');
  process.exitCode = 1;
}
