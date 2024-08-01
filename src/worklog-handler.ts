import dayjs from 'dayjs';
import * as api from './api-controller';

class WorklogHandler {
  filterStartTime: Date;
  filterEndTime: Date;

  constructor(private author: string) {
    this.filterStartTime = new Date(`${Bun.env.START_DATE}T00:00:00`);
    this.filterEndTime = new Date(`${Bun.env.END_DATE}T23:59:59`);
  }

  get formattedStart() {
    return dayjs(this.filterStartTime).format('YYYY-MM-DD');
  }

  get formattedEnd() {
    return dayjs(this.filterEndTime).format('YYYY-MM-DD');
  }

  public async getWorklogs() {
    const issues = await this._getIssuesList();

    const worklogs = (await Promise.all(issues.map((issue) => this._getIssueWorklogs(issue)))).reduce((prev, curr) => {
      Array.prototype.push.apply(prev, curr);
      return prev;
    }, [] as AdaptedWorklog[]);

    return worklogs;
  }

  private async _getIssuesList(): Promise<AdaptedIssue[]> {
    return (
      await api.searchIssues(
        `worklogAuthor IN ("${this.author}") AND worklogDate >= ${this.formattedStart} AND worklogDate <= ${this.formattedEnd}`
      )
    ).map((issue) => ({
      issueId: issue.id,
      issueKey: issue.key,
      summary: issue.fields.summary,
    }));
  }

  private async _getIssueWorklogs(issue: AdaptedIssue): Promise<AdaptedWorklog[]> {
    const worklogs = (
      await api.getIssueWorklogs(issue.issueId, this.filterEndTime.getTime(), this.filterStartTime.getTime())
    ).worklogs
      .filter((worklog) => {
        const startTime = new Date(worklog.started);
        const endTime = new Date(startTime.getTime() + worklog.timeSpentSeconds * 1000);

        const condition =
          startTime.getTime() > this.filterStartTime.getTime() &&
          endTime.getTime() < this.filterEndTime.getTime() &&
          worklog.author.emailAddress == this.author;

        return condition;
      })
      .map((worklog) => {
        return {
          started: worklog.started,
          timeSpentSeconds: worklog.timeSpentSeconds,
          author: worklog.author.emailAddress,
          key: issue.issueKey,
          summary: issue.summary,
          updated: worklog.updated,
        };
      });

    return worklogs;
  }
}

export default WorklogHandler;
