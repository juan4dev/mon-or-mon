import { readFile, writeFile } from 'node:fs/promises';

const packageJsonUrl = new URL('../package.json', import.meta.url);
const outputUrl = new URL('../src/app/app-version.ts', import.meta.url);
const packageJson = JSON.parse(await readFile(packageJsonUrl, 'utf8'));

if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
  throw new Error('package.json must define a non-empty version string.');
}

const source = `// This file is generated from package.json. Do not edit manually.\nexport const APP_VERSION = ${JSON.stringify(packageJson.version)};\n`;

await writeFile(outputUrl, source);
