import { table, type TableUserConfig } from 'table';
import dayjs from 'dayjs';
import chalk from 'chalk';
import { JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH } from '../constants';
import { timeFormatter, truncatedString } from '../utils';

class IndividualTableView implements TableView {
  header: { key: string; label: string; width: number }[];

  constructor() {
    this.header = [
      { key: 'date', label: 'Date', width: 10 },
      { key: 'jiraId', label: 'JIRA ID', width: 15 },
      { key: 'summary', label: 'Summary', width: JIRA_TASK_SUMMARY_TEXT_MAX_WIDTH },
      { key: 'time', label: 'Time', width: 7 },
      { key: 'lut', label: 'Updated time', width: 16 },
      { key: 'total', label: 'Total', width: 7 },
    ];
  }

  processData(worklogs: AdaptedWorklog[]) {
    const dateMap = new Map(
      [
        ...Map.groupBy(worklogs, (worklog) => {
          const date = worklog.started.split('T').shift() as string;
          return date;
        }).entries(),
      ].sort()
    );

    const tableContent: string[][] = [this.header.map((_header) => _header.label)];
    const tableConfig: TableUserConfig = {
      columns: this.header.map((_header) => ({ width: _header.width })),
      spanningCells: [],
    };

    const dateColumnPos = this.header.findIndex((column) => column.key === 'date');
    const totalColumnPos = this.header.findIndex((column) => column.key === 'total');
    let total = 0;

    for (let [date, worklogs] of dateMap.entries()) {
      let dateTotal = 0;
      tableConfig.spanningCells?.push({ row: tableContent.length, col: dateColumnPos, rowSpan: worklogs.length });
      tableConfig.spanningCells?.push({ row: tableContent.length, col: totalColumnPos, rowSpan: worklogs.length });

      worklogs.forEach((worklog, i) => {
        tableContent.push([
          i === 0 ? date : '',
          worklog.key,
          truncatedString(worklog.summary),
          timeFormatter(worklog.timeSpentSeconds),
          dayjs(new Date(worklog.updated)).format('YYYY-MM-DD HH:mm'),
          '',
        ]);

        dateTotal += worklog.timeSpentSeconds;

        if (i === worklogs.length - 1) {
          tableContent[tableContent.length - worklogs.length][totalColumnPos] = timeFormatter(dateTotal);
        }
      });

      total += dateTotal;
    }

    console.log(table(tableContent, tableConfig));

    const percentage = Math.round(total / (8 * 36 * dateMap.size));
    const style = percentage < 100 ? chalk.bold.red : chalk.bold.green;

    console.log(
      `Total Worklog: ${timeFormatter(total)} (${Math.round(total / 36) / 100}h) (${style(percentage + '%')})`
    );
  }
}

export default IndividualTableView;
