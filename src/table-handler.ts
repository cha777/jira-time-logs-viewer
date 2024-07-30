import { table, type TableUserConfig } from 'table';
import { JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH, ViewMode } from './constants';
import { timeFormatter, truncatedString } from './utils';
import chalk from 'chalk';

type Header = { key: string; label: string; width?: number; pos: number };
class TableHandler {
  private viewMode: ViewMode;
  private header: Header[];

  constructor(private users: string[]) {
    const columnConfigurations: Record<string, Omit<Header, 'pos' | 'key'>> = {
      date: { label: 'Date', width: 10 },
      author: { label: 'Author', width: users.reduce((prev, curr) => Math.max(prev, curr.length), 0) },
      jiraId: { label: 'JIRA ID', width: 15 },
      summary: { label: 'Summary', width: JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH },
      time: { label: 'Time', width: 7 },
      total: { label: 'Total', width: 7 },
    };

    this.viewMode = users.length > 1 ? ViewMode.Team : ViewMode.Individual;

    const columnIds =
      this.viewMode === ViewMode.Individual
        ? ['date', 'jiraId', 'summary', 'time', 'total']
        : ['date', 'author', 'jiraId', 'summary', 'time', 'total'];

    this.header = columnIds.map((columnId, i) => ({ ...columnConfigurations[columnId], pos: i, key: columnId }));
  }

  public processData(worklogs: AdaptedWorklog[]) {
    const worklogMap = new Map<string, Map<string, AdaptedWorklog[]>>();
    const totalMap = new Map<string, number>();

    const dateMap = new Map(
      [
        ...Map.groupBy(worklogs, (worklog) => {
          totalMap.set(worklog.author, (totalMap.get(worklog.author) ?? 0) + worklog.timeSpentSeconds);

          const date = worklog.started.split('T').shift() as string;
          return date;
        }).entries(),
      ].sort()
    );

    for (let [date, worklogs] of dateMap.entries()) {
      let authorMap = Map.groupBy(worklogs, (worklog) => worklog.author);

      if (this.viewMode === ViewMode.Team) {
        this.users.forEach((_user) => {
          if (!authorMap.has(_user)) {
            authorMap.set(_user, []);
          }
        });

        authorMap = new Map([...authorMap.entries()].sort());
      }

      worklogMap.set(date, authorMap);
    }

    this._showTableView(worklogMap);
    this._showTotalWorklog(worklogMap.size, totalMap);
  }

  private _showTableView(worklogMap: Map<string, Map<string, AdaptedWorklog[]>>) {
    const tableContent: string[][] = [this.header.map((_header) => _header.label)];
    const tableConfig: TableUserConfig = {
      columns: this.header.map((_header) => ({ width: _header.width })),
      spanningCells: [],
    };

    for (let [date, authorWorklog] of worklogMap.entries()) {
      let rowCount = 0;
      const columnMap = this.header.reduce((prev, _header) => {
        prev[_header.key] = { content: [], rowSpan: 1 };
        return prev;
      }, {} as Record<string, { content: string[]; rowSpan?: number }>);

      columnMap.date.content.push(date);

      for (let [author, worklogs] of authorWorklog.entries()) {
        let total = 0;

        if (worklogs.length > 0) {
          worklogs.forEach((worklog, i) => {
            columnMap.jiraId.content.push(worklog.key);
            columnMap.summary.content.push(truncatedString(worklog.summary));
            columnMap.time.content.push(timeFormatter(worklog.timeSpentSeconds));

            total += worklog.timeSpentSeconds;
            rowCount++;

            if (columnMap.author) {
              if (i === 0) {
                columnMap.author.content.push(author);
              } else {
                columnMap.author.content.push('');
              }
            }

            columnMap.total.content.push('');

            if (i === worklogs.length - 1) {
              columnMap.total.content[columnMap.total.content.length - worklogs.length] = timeFormatter(total);
            }
          });
        } else {
          rowCount++;

          if (columnMap.author) {
            columnMap.author.content.push(author);
          }

          columnMap.jiraId.content.push('--');
          columnMap.summary.content.push('--');
          columnMap.time.content.push('0m');
          columnMap.total.content.push('0m');
        }

        const authorColumn = this.header.find((_header) => _header.key === 'author');

        if (authorColumn) {
          tableConfig.spanningCells?.push({
            col: authorColumn.pos,
            row: tableContent.length + rowCount - Math.max(worklogs.length, 1),
            rowSpan: Math.max(worklogs.length, 1),
          });
        }

        const totalColumn = this.header.find((_header) => _header.key === 'total');

        if (totalColumn) {
          tableConfig.spanningCells?.push({
            col: totalColumn.pos,
            row: tableContent.length + rowCount - Math.max(worklogs.length, 1),
            rowSpan: Math.max(worklogs.length, 1),
          });
        }
      }

      tableConfig.spanningCells?.push({
        col: 0,
        row: tableContent.length,
        rowSpan: rowCount,
        verticalAlignment: 'middle',
      });

      for (let i = 0; i < rowCount; i++) {
        const rowData = Object.values(columnMap).map((columnData) => columnData.content[i] ?? '');

        tableContent.push(rowData);
      }
    }

    console.log(table(tableContent, tableConfig));
  }

  private _showTotalWorklog(approxWorkingDays: number, totalMap: Map<string, number>) {
    const _worklogDisplayValue = (worklog: number) => {
      const percentage = Math.round(worklog / (8 * 36 * approxWorkingDays));
      const style = percentage < 100 ? chalk.bold.red : chalk.bold.green;

      return `${timeFormatter(worklog)} (${Math.round(worklog / 36) / 100}h) (${style(percentage + '%')})`;
    };
    if (this.viewMode === ViewMode.Individual) {
      const userTotal = totalMap.get(process.env.USER_NAME!) ?? 0;
      console.log(`Total Worklog: ${_worklogDisplayValue(userTotal)}`);
    } else {
      console.log(chalk.cyan('Total Worklog:'));

      for (let [author, total] of totalMap.entries()) {
        console.log(`\t${author}: ${_worklogDisplayValue(total)}`);
      }
    }
  }
}

export default TableHandler;
