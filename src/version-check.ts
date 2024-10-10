import semver from 'semver';
import chalk from 'chalk';

try {
  const response = await fetch('https://api.github.com/repos/cha777/jira-time-logs-viewer/releases/latest', {
    signal: AbortSignal.timeout(2000),
  });

  if (response.ok) {
    const data = await response.json();
    const latestVersion = semver.valid(data.tag_name);

    if (latestVersion && process.env.npm_package_version && semver.gt(latestVersion, process.env.npm_package_version)) {
      console.log(chalk.green(`A newer version available: ${latestVersion}`));
      console.log(`Please visit ${data.html_url} to download latest release\n`);
    }
  }
} catch (e) {}
