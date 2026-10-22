import { mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

mkdirSync('reports', { recursive: true });
const rawPath = '.node-junit.tmp.xml';
const result = spawnSync(process.execPath, [
  '--test',
  '--test-reporter=spec',
  '--test-reporter-destination=stdout',
  '--test-reporter=junit',
  `--test-reporter-destination=${rawPath}`,
  'tests/calculadora.test.cjs',
  'tests/tienda.test.cjs',
  'tests/api.test.cjs',
], { stdio: 'inherit' });

// Node genera testcases directamente bajo testsuites. CircleCI espera una suite.
try {
  const raw = readFileSync(rawPath, 'utf8');
  const tests = Number(raw.match(/<!-- tests (\d+) -->/)?.[1] ?? 0);
  const failures = Number(raw.match(/<!-- fail (\d+) -->/)?.[1] ?? 0);
  const report = raw.includes('<testsuite ')
    ? raw
    : raw
        .replace('<testsuites>', `<testsuites tests="${tests}" failures="${failures}">\n<testsuite name="mini-tienda" tests="${tests}" failures="${failures}" file="tests">`)
        .replace('</testsuites>', '</testsuite>\n</testsuites>');
  writeFileSync('reports/junit.xml', report);
  unlinkSync(rawPath);
} catch (error) {
  console.error('No se pudo crear el reporte JUnit:', error);
  process.exitCode = 1;
}

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
} else if (process.exitCode !== 1) {
  process.exitCode = result.status ?? 1;
}
