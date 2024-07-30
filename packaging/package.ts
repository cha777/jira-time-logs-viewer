import path from 'node:path';
import AdmZip from 'adm-zip';

const filesToCopy = ['README.md', '.env-sample'];

export const createTargetBundle = (target: { template: string; output: string }) => {
  const zipFileName = `${process.env.npm_package_name}-${target.template}.zip`;
  const outputDir = path.resolve(__dirname, '../dist');
  const rootDir = path.resolve(__dirname, '../');

  const zip = new AdmZip();
  zip.addLocalFile(path.resolve(outputDir, target.output));

  filesToCopy.forEach((file) => {
    zip.addLocalFile(path.resolve(rootDir, file));
  });

  zip.writeZip(path.resolve(outputDir, zipFileName));
};
