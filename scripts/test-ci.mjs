import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

mkdirSync('reports', { recursive: true });

const result = spawnSync(process.execPath, [
  '--test',
  '--test-reporter=spec',
  '--test-reporter-destination=stdout',
  '--test-reporter=junit',
  '--test-reporter-destination=reports/junit.xml',
  'tests/calculadora.test.cjs',
], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}

