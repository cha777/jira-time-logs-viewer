import chalk from 'chalk';

const appName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;

console.log(`
${chalk.bold.cyanBright('='.repeat(appName.length + 10))}
${' '.repeat(5)}${chalk.bold.blueBright(appName)}${' '.repeat(5)}
${chalk.bold.cyanBright('='.repeat(appName.length + 10))}
`);
