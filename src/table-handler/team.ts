import { table, type TableUserConfig } from 'table';
import dayjs from 'dayjs';
import chalk from 'chalk';
import { timeFormatter } from '../utils';

class TeamTableView implements TableView {
  header: { key: string; label: string; width: number }[];
  users: string[];

  constructor(users: string[]) {
    this.users = users;
    this.header = [
      { key: 'author', label: 'Author', width: users.reduce((prev, curr) => Math.max(prev, curr.length), 0) },
      { key: 'lut', label: 'Updated time', width: 16 },
      { key: 'total', label: 'Total', width: 10 },
      { key: 'percentage', label: 'Percentage', width: 10 },
    ];
  }

  processData(worklogs: AdaptedWorklog[]) {
    const tableContent: (string | number)[][] = [];
    const tableConfig: TableUserConfig = {
      columns: this.header.map((_header) => ({ width: _header.width })),
    };

    let totalWorkingDays = 0;
    const authorMap = new Map([...Map.groupBy(worklogs, (worklog) => worklog.author)]);

    this.users.forEach((user) => {
      if (!authorMap.has(user)) {
        authorMap.set(user, []);
      }
    });

    for (let [author, records] of authorMap.entries()) {
      const dates = new Set();
      let total = 0;
      let lut = 0;

      records.forEach((record) => {
        total += record.timeSpentSeconds;
        dates.add(record.started.split('T').shift() as string);
        lut = Math.max(lut, new Date(record.updated).getTime());
      });

      totalWorkingDays = Math.max(totalWorkingDays, dates.size);

      tableContent.push([
        author,
        lut ? dayjs(new Date(lut)).format('YYYY-MM-DD HH:mm') : '--',
        timeFormatter(total),
        total,
      ]);
    }

    const percentageColumnIdx = this.header.findIndex((column) => column.key === 'percentage');

    tableContent.forEach((record) => {
      const percentage =
        totalWorkingDays > 0 ? (record[percentageColumnIdx] as number) / (8 * 36 * totalWorkingDays) : 0;
      const style = percentage < 100 ? chalk.bold.red : chalk.bold.green;

      record[percentageColumnIdx] = style(`${Math.round(percentage)}%`);
    });

    tableContent.unshift(this.header.map((_header) => _header.label));

    console.log(table(tableContent, tableConfig));
  }
}

export default TeamTableView;
