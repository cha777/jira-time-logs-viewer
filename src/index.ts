import './greeting';

if (Bun.env.STOP_APP_UPDATE_CHECK !== '1') {
  await import('./version-check');
}

import { configurations } from './config-handler';

if (Bun.env.STOP_APP_ANALYTICS !== '1') {
  await import('./analytics-handler');
}

import TableHandler from './table-handler';
import WorklogHandler from './worklog-handler';
import { ViewMode } from './constants';

let worklogs: AdaptedWorklog[];

if (configurations.viewMode == ViewMode.Individual) {
  const worklogHandler = new WorklogHandler(configurations.users[0]);
  worklogs = await worklogHandler.getWorklogs();
} else {
  worklogs = (
    await Promise.all(
      configurations.users.map((user) => {
        const worklogHandler = new WorklogHandler(user);
        return worklogHandler.getWorklogs();
      })
    )
  ).reduce((prev, curr) => {
    Array.prototype.push.apply(prev, curr);
    return prev;
  }, [] as AdaptedWorklog[]);
}

const tableHandler = new TableHandler(configurations);
tableHandler.prepare(worklogs);
