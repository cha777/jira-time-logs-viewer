const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

(async () => {
  const rootDir = path.resolve(__dirname, '../');
  const packageJsonFilePath = path.resolve(rootDir, 'package.json');
  const filesToCopy = ['README.md', '.env-sample'];

  const {
    name,
    pkg: { targets, outputPath },
  } = JSON.parse(await fs.promises.readFile(packageJsonFilePath));

  targets.forEach((target) => {
    const [, platform, arch] = target.split('-');
    const zipFileName = `${name}-${platform}-${arch}.zip`;
    let srcPath = path.resolve(outputPath, `${name}-${platform}`);

    if (platform === 'win') {
      srcPath += '.exe';
    }

    const zip = new AdmZip();
    zip.addLocalFile(srcPath);

    filesToCopy.forEach((file) => {
      zip.addLocalFile(path.resolve(rootDir, file));
    });

    zip.writeZip(path.resolve(outputPath, zipFileName));
  });
})();
