const path = require('path');

require('dotenv').config({ path: path.resolve('.env') });

// Verify environment variables
(() => {
  if (!process.env.JIRA_URL) {
    throw new Error('JIRA_URL is missing');
  }

  if (!process.env.JIRA_USER_NAME) {
    throw new Error('JIRA_USER_NAME is missing');
  }

  if (!process.env.JIRA_API_TOKEN) {
    throw new Error('JIRA_API_TOKEN is missing');
  }

  if (!process.env.START_DATE || !process.env.END_DATE) {
    throw new Error('START_DATE or END_DATE environment variables are missing');
  }
})();

const { table } = require('table');
const dayjs = require('dayjs');
const jiraAPIController = require('./api-controller');

(async () => {
  const username = process.env.USER_NAME || process.env.JIRA_USER_NAME;
  const filterStartTime = new Date(`${process.env.START_DATE}T00:00:00`);
  const filterEndTime = new Date(`${process.env.END_DATE}T23:59:59`);

  const formattedStart = dayjs(filterStartTime).format('YYYY-MM-DD');
  const formattedEnd = dayjs(filterEndTime).format('YYYY-MM-DD');

  const result = await jiraAPIController.searchIssues(
    `worklogAuthor = "${username}" AND worklogDate >= ${formattedStart} AND worklogDate <= ${formattedEnd}`
  );

  if (!result.issues && result.errorMessages) {
    throw new Error(result.errorMessages.join('\n'));
  }

  // create an array of issue IDs and keys from result.issues
  const issues = result.issues.map((issue) => {
    return {
      issueId: issue.id,
      issueKey: issue.key,
      summary: issue.fields.summary,
    };
  });

  // for each issue ID, get worklogs, filter by started date and match worklog author to process.env.JIRA_BASIC_AUTH_USERNAME
  // create an array of promises , each promise should return the worklogs for its issue ID, and use promise.all to resolve them

  const worklogPromises = issues.map((issue) => {
    return jiraAPIController
      .getIssueWorklogs(issue.issueId, filterEndTime.getTime(), filterStartTime.getTime())
      .then((result) => {
        const worklogs = result.worklogs;
        // return worklog and add issueID and key to each worklog
        return worklogs
          .filter((worklog) => {
            const startTime = new Date(worklog.started);
            const endTime = new Date(startTime.getTime() + worklog.timeSpentSeconds * 1000);
            const condition =
              startTime.getTime() > filterStartTime.getTime() &&
              endTime.getTime() < filterEndTime.getTime() &&
              worklog.author.emailAddress == username;

            return condition;
          })
          .map((worklog) => {
            worklog.issue = issue;
            return worklog;
          });
      });
  });

  const timeFormatter = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.round(remainingSeconds / 60);
    let displayTime = `${hours}h`;

    if (minutes > 0) {
      displayTime += ` ${minutes}m`;
    }

    return displayTime;
  };

  const { userWorkLogs, total } = await Promise.all(worklogPromises).then((issues) => {
    // for each worklog, create an event object
    let total = 0;
    let userWorkLogs = new Map();

    issues.forEach((issue) => {
      issue.forEach((log) => {
        total += log.timeSpentSeconds;

        const dateKey = log.started.split('T').shift();

        if (!userWorkLogs.has(dateKey)) {
          userWorkLogs.set(dateKey, { jiraIds: [], time: 0, date: dateKey });
        }

        const worklogRecord = userWorkLogs.get(dateKey);
        worklogRecord.jiraIds.push(log.issue.issueKey + ' ' + log.issue.summary + ' - ' + timeFormatter(log.timeSpentSeconds));
        worklogRecord.time += log.timeSpentSeconds;
      });
    });

    userWorkLogs = new Map([...userWorkLogs.entries()].sort());

    return { userWorkLogs, total };
  });

  const tableContent = [['Date', 'Tasks', 'Time logs']];

  for (let record of userWorkLogs.values()) {
    tableContent.push([record.date, record.jiraIds.join('\n'), timeFormatter(record.time)]);
  }

  console.log(table(tableContent));
  console.log(`Total Worklog: ${timeFormatter(total)} (${Math.round(total / 36) / 100}h)`);
})();
