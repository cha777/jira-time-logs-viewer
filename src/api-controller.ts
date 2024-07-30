const defaultURL = `https://${process.env.JIRA_URL}`;

const headers = (() => {
  const bearerToken =
    'Basic ' + Buffer.from(`${process.env.JIRA_USER_NAME}:${process.env.JIRA_API_TOKEN}`).toString('base64');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: bearerToken,
  };

  return defaultHeaders;
})();

export const searchIssues = async (jql: string): Promise<Issue[]> => {
  const maxResults = 100; // Hardcoded since no point having user configuration
  let startAt = 0;
  let pageCount = 1;
  let issueList: Issue[] = [];

  while (true) {
    const res = await fetch(defaultURL + `/rest/api/3/search?maxResults=${maxResults}&startAt=${startAt}&jql=${jql}`, {
      method: 'GET',
      headers,
    });

    const data = await res.json();

    if (data.issues) {
      issueList = issueList.concat(data.issues);

      if (startAt === 0) {
        pageCount = Math.ceil(data.total / data.maxResults);
      }

      startAt += data.maxResults;
      pageCount--;

      if (pageCount <= 0) break;
    } else {
      throw new Error(data.errorMessages.join('\n'));
    }
  }

  return issueList;
};

export const getIssueWorklogs = async (
  issueId: string,
  startedBefore: number,
  startedAfter: number
): Promise<{ worklogs: Worklog[] }> => {
  const res = await fetch(
    defaultURL +
      '/rest/api/2/issue/' +
      issueId +
      '/worklog?startedBefore=' +
      startedBefore +
      '&startedAfter=' +
      startedAfter +
      '&expand=renderedFields',
    {
      method: 'GET',
      headers,
    }
  );

  return await res.json();
};
