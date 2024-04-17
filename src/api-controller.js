const fetch = require('node-fetch');
const https = require('https');

const httpsAgent = new https.Agent();
const defaultURL = `https://${process.env.JIRA_URL}`;

function _getDefaultHeaders() {
  const bearerToken =
    'Basic ' + Buffer.from(`${process.env.JIRA_USER_NAME}:${process.env.JIRA_API_TOKEN}`).toString('base64');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: bearerToken,
  };

  return defaultHeaders;
}

exports.searchIssues = async function (jql) {
  const maxResults = 100; // Hardcoded since no point having user configuration
  let startAt = 0;
  let pageCount = 1;
  let issueList = [];

  while (true) {
    const res = await fetch(defaultURL + `/rest/api/3/search?maxResults=${maxResults}&startAt=${startAt}&jql=${jql}`, {
      method: 'GET',
      headers: _getDefaultHeaders(),
      agent: httpsAgent,
    });

    const data = await res.json();

    if (data.issues) {
      issueList = issueList.concat(data.issues);

      if (startAt === 0) {
        pageCount = Math.ceil(data.total / data.maxResults);
      }

      startAt += data.maxResults;
      pageCount--;

      if (pageCount === 0) break;
    } else {
      throw new Error(data.errorMessages.join('\n'));
    }
  }

  return issueList;
};

exports.getIssueWorklogs = async function (issueId, startedBefore, startedAfter) {
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
      headers: _getDefaultHeaders(),
      agent: httpsAgent,
    }
  );
  return await res.json();
};
