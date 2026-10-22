# Demostración de CI/CD con CircleCI y JavaScript

Proyecto académico para mostrar un pipeline real: **compilar → probar → desplegar (simulación)**. La aplicación es una calculadora de línea de comandos. `esbuild` empaqueta el código JavaScript; el ejecutor de pruebas integrado en Node.js genera un reporte JUnit XML que CircleCI muestra en la pestaña **Tests**. La última etapa solo imprime un resultado, no publica software en Internet.

## Estructura

```text
.circleci/config.yml          Pipeline de CircleCI
src/calculadora.js            Funciones que se prueban
src/cli.js                    Aplicación de línea de comandos
tests/calculadora.test.cjs    Cuatro pruebas unitarias
scripts/test-ci.mjs           Pruebas + reporte JUnit
scripts/demo.mjs              Introduce y corrige el fallo de la exposición
package-lock.json            Versiones exactas para npm ci
```

## Comprobar el proyecto en tu computadora

Abre PowerShell en `C:\Users\hp\Documents\visualcode\circleCI` y ejecuta:

```powershell
npm ci
npm run build
npm test
npm run test:ci
npm start
```

Resultado esperado: `npm run build` crea `dist/`, `npm test` indica **4 tests, 4 pass, 0 fail**, `npm run test:ci` crea `reports/junit.xml`, y `npm start` imprime `2 + 3 = 5`. Las carpetas `dist/` y `reports/` no se suben a GitHub.

## Activar CircleCI una sola vez

1. Entra a [CircleCI](https://app.circleci.com/) con tu cuenta y conecta GitHub si te lo pide.
2. En **Home**, usa **Create Project** o **Set Up Project** según el tipo de organización que muestre tu cuenta.
3. Selecciona el repositorio `sebastiansoto1407/CircleCI` y la rama `main`.
4. Elige el archivo de configuración existente `.circleci/config.yml`. Si el asistente te pide crear un pipeline y un trigger, selecciona GitHub como origen y el trigger de **push** para la rama `main` o todas las ramas. No reemplaces el archivo existente por una plantilla.
5. Abre **Pipelines** y comprueba que aparezca el workflow `demostracion`.

La interfaz exacta cambia entre organizaciones creadas con GitHub OAuth y las creadas con la integración nueva de GitHub. Si el proyecto no aparece, comprueba que CircleCI tenga permiso sobre ese repositorio y que el pipeline tenga un trigger de push. [Guía oficial de creación de proyectos](https://circleci.com/docs/guides/getting-started/create-project/).

## Ensayo de la demostración en vivo

Comprueba primero que `git status --short` no muestre cambios. Para producir un pipeline correcto tras conectar CircleCI, modifica la salida de la aplicación JavaScript y publica:

```powershell
npm run demo:success
git diff -- src/cli.js
git add src/cli.js
git commit -m "Ensayar pipeline correcto"
git push origin main
```

El script cambia el texto de salida de `src/cli.js` para agregar la etiqueta `Resultado:`. En **Pipelines**, espera el resultado del commit. Deben verse `compilar: Success`, `probar: Success` y `desplegar: Success`. En el trabajo `probar`, la pestaña **Tests** debe mostrar 4 pruebas aprobadas. El trabajo `desplegar` imprime `Resultado: 2 + 3 = 5` y el aviso de simulación.

Para simular un error real de código:

```powershell
npm run demo:fail
git diff -- src/calculadora.js
git add src/calculadora.js
git commit -m "Demostrar fallo de pruebas"
git push origin main
```

El script cambia `return a + b;` por `return a - b;`. En el nuevo pipeline, `compilar` debe tener **Success**, `probar` debe tener **Failed** y `desplegar` debe quedar **Not run / Blocked**. La pestaña **Tests** mostrará los casos fallidos y `reports/junit.xml` quedará guardado como artefacto. No hagas un `rerun` del mismo commit para corregirlo: se necesita un nuevo commit.

Restaura el funcionamiento:

```powershell
npm run demo:fix
npm run build
npm test
git add src/calculadora.js
git commit -m "Corregir suma y recuperar pipeline"
git push origin main
```

La última ejecución debe volver a mostrar los tres trabajos en **Success**. Si `git push` pide autenticación, completa el inicio de sesión de GitHub en el navegador. Si indica que no hay cambios, revisa `git status` y el historial con `git log -3 --oneline`.

## Qué hace cada trabajo

| Trabajo | Entrada y acción | Salida |
|---|---|---|
| `compilar` | `npm ci` y `npm run build` en `cimg/node:24.10.0` | `dist/` en el workspace y como artefacto |
| `probar` | Recibe `dist/`, ejecuta cuatro pruebas | JUnit XML, vista Tests y estado correcto o fallido |
| `desplegar` | Solo se inicia cuando `probar` termina correctamente | Ejecución de ejemplo y mensaje de simulación |

`requires` en `.circleci/config.yml` establece el orden. Cada trabajo usa un contenedor Docker aislado, por lo que `persist_to_workspace` y `attach_workspace` transfieren `dist/` entre trabajos. `store_test_results` publica el XML aun si las pruebas fallan.

## Solución de problemas

| Síntoma | Comprobación |
|---|---|
| No aparece pipeline tras el push | Revisa permiso de GitHub, trigger de push, rama `main` y ruta `.circleci/config.yml`. |
| `npm ci` falla | Confirma que `package-lock.json` esté publicado junto con `package.json`. |
| El trabajo `probar` no encuentra `dist/` | Comprueba que `compilar` termine y que workspace esté adjuntado. |
| Tests no aparecen en CircleCI | Comprueba `reports/junit.xml` en artefactos y la ruta `store_test_results: reports`. |
| El despliegue no corre | Abre `probar`: si falló, CircleCI lo bloqueó como estaba previsto. |

## Fuentes técnicas

- [Creación de proyectos y triggers](https://circleci.com/docs/guides/getting-started/create-project/)
- [Referencia de configuración](https://circleci.com/docs/reference/configuration-reference/)
- [Workflows y dependencias](https://circleci.com/docs/guides/orchestrate/workflows/)
- [Publicación de resultados de pruebas](https://circleci.com/docs/guides/test/collect-test-data/)
- [Imagen Docker de Node.js](https://circleci.com/developer/images/image/cimg/node)

