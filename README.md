# Mini tienda con CircleCI

Proyecto JavaScript para aprender CI/CD con una aplicación visible en el navegador. La tienda permite agregar y quitar cuatro productos, aplicar el cupón `AHORRA10`, calcular el envío y ver el total. Los datos viven en memoria mientras el servidor está abierto. No hay pagos ni base de datos.

El pipeline ejecuta tres trabajos en orden: **compilar → probar → desplegar (simulado)**. El último trabajo comprueba que la API y la página abran; no publica el sitio en Internet.

## Reparto sencillo para cuatro integrantes

| Integrante | Parte | Archivo principal | Qué puede mostrar |
|---|---|---|---|
| 1 | Interfaz | `public/index.html`, `public/style.css`, `public/app.js` | Agregar productos y ver el carrito en pantalla |
| 2 | Reglas de la tienda | `src/tienda.js`, `src/calculadora.js` | Subtotal, cupón, envío y total |
| 3 | Servidor y API | `src/server.js`, `src/start.js` | Rutas `/api/productos`, `/api/carrito`, `/api/health` |
| 4 | Pruebas y CircleCI | `tests/`, `.circleci/config.yml` | Pipeline verde, fallo y despliegue bloqueado |

## Ejecutar en tu computadora

En PowerShell:

```powershell
cd C:\Users\hp\Documents\visualcode\circleCI
npm ci
npm run build
npm test
npm run smoke
npm run web
```

Abre **http://localhost:3000** en un navegador. La terminal debe mostrar `Tienda lista en http://localhost:3000`. En la página, agrega un cuaderno, aplica `AHORRA10` y observa los importes. Detén el servidor con **Ctrl+C**. `npm test` debe terminar con **15 pruebas aprobadas y 0 fallidas**. `npm run smoke` debe imprimir `Smoke test: API y página web funcionan.`

Si el puerto 3000 está ocupado, usa `$env:PORT=3001; npm run web` y abre `http://localhost:3001`.

## Qué mirar en CircleCI

El repositorio ya está conectado: [Pipelines de CircleCI](https://app.circleci.com/pipelines/github/sebastiansoto1407/CircleCI). Cada `git push` a `main` inicia una ejecución nueva.

1. Abre **Pipelines** y entra al número de la ejecución más reciente.
2. En el workflow **demostracion**, verás `compilar`, `probar` y `desplegar` conectados en ese orden.
3. Abre **compilar**: en los pasos verás `npm ci` y `npm run build`; en **Artifacts**, los archivos de `dist/`.
4. Abre **probar**: en la salida verás las pruebas; en **Tests**, los resultados; en **Artifacts**, `reports/junit.xml`.
5. Abre **desplegar**: la salida debe decir `Smoke test: API y página web funcionan.` y `Despliegue simulado completado...`.

Un trabajo en verde significa que terminó bien. Si `probar` falla, `desplegar` queda sin ejecutar porque `requires` exige que la prueba termine correctamente.

## Crear un cambio correcto

El script `demo:success` modifica el texto de la calculadora de línea de comandos. Revisa el cambio antes de publicarlo:

```powershell
npm run demo:success
git diff
npm run build
npm test
git add src/cli.js
git commit -m "Mostrar cambio correcto en CircleCI"
git push origin main
```

Al abrir el nuevo pipeline en CircleCI, los tres trabajos deben quedar **Success**. Si el script dice que no cambió nada, ya se usó una vez; puedes editar otro texto visible de `src/cli.js` y hacer el commit.

## Demostrar que una prueba detiene el pipeline

Hazlo solo cuando quieras mostrar el fallo. Esto crea un commit incorrecto a propósito; luego hay que corregirlo.

```powershell
npm run demo:fail
git diff -- src/calculadora.js
git add src/calculadora.js
git commit -m "Demostrar fallo de pruebas"
git push origin main
```

En CircleCI, `compilar` debe quedar **Success**, `probar` **Failed** y `desplegar` sin ejecutar. Al abrir `probar`, verás qué prueba esperaba un total y recibió otro. Para recuperar el proyecto:

```powershell
npm run demo:fix
npm run build
npm test
git add src/calculadora.js
git commit -m "Corregir cálculo y recuperar pipeline"
git push origin main
```

El siguiente pipeline debe volver a tener tres trabajos verdes. No uses **Rerun** sobre el commit fallido para arreglar el código: ese botón repite el mismo código. Necesitas un commit nuevo.

## Estructura importante

```text
.circleci/config.yml       Trabajos y orden del pipeline
src/calculadora.js         Operaciones usadas en el total
src/tienda.js              Catálogo, carrito y reglas de precios
src/server.js              API y archivos de la página
src/start.js               Arranque del servidor
public/                    Interfaz web
tests/                     Pruebas de cálculo, tienda y API
scripts/test-ci.mjs        Reporte JUnit para CircleCI
scripts/smoke.mjs          Comprobación rápida de la aplicación
scripts/demo.mjs           Cambios de ejemplo para pasar/fallar
```

`dist/` y `reports/` son archivos generados, ignorados por Git. CircleCI recibe `dist/` mediante un workspace y guarda el resultado XML como artefacto y dato de la pestaña **Tests**.
