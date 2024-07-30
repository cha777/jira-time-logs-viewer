import './greeting';
import { configurations } from './config-handler';
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

const tableHandler = new TableHandler(configurations.users);
tableHandler.processData(worklogs);
