import path from 'node:path';

export const createBuild = (target: { template: string; output: string }) => {
  return new Promise(async (resolve, reject) => {
    const rootDir = path.resolve(__dirname, '../');
    const proc = Bun.spawn(
      [
        'bun',
        'build',
        './src/index.ts',
        `--target=bun-${target.template}`,
        '--compile',
        '--minify',
        '--sourcemap',
        `--outfile=./dist/${target.output}`,
      ],
      {
        cwd: rootDir,
        onExit(_subprocess, _exitCode, _signalCode, error) {
          if (error) {
            reject(error);
          } else {
            resolve({});
          }
        },
      }
    );

    const text = await Bun.readableStreamToText(proc.stdout);
    console.log(text);
  });
};
