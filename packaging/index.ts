import path from 'node:path';
import fs from 'node:fs/promises';
import { createTargetBundle } from './package';
import { createBuild } from './build';

const targets = [
  { template: 'windows-x64', output: `${process.env.npm_package_name}.exe` },
  { template: 'darwin-x64', output: process.env.npm_package_name! },
];

const outputDir = path.resolve(__dirname, '../dist');

try {
  const items = await fs.readdir(outputDir);
  Promise.all(items.map((item) => fs.rm(path.join(outputDir, item))));
} catch {
  await fs.mkdir(outputDir);
}

await Promise.all(targets.map((target) => createBuild(target)));

targets.forEach((target) => {
  createTargetBundle(target);
});
