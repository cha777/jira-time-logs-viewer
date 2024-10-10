import IndividualTableView from './individual';
import TeamTableView from './team';
import { ViewMode } from '../constants';
import type { configurations } from '../config-handler';

class TableHandler {
  private viewMode: ViewMode;
  private users: string[];

  constructor({ viewMode, users }: typeof configurations) {
    this.viewMode = viewMode;
    this.users = users;
  }

  async prepare(worklogs: AdaptedWorklog[]) {
    const handler: TableView =
      this.viewMode === ViewMode.Individual ? new IndividualTableView() : new TeamTableView(this.users);

    handler.processData(worklogs);
  }
}

export default TableHandler;
