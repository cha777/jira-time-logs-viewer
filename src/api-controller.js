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
  let formattedRes;
  let startAt = 0;
  let pageCount = 1;
  let issueList = [];

  while (true) {
    if (pageCount === 0) break;

    let response  = await fetch(
      defaultURL + `/rest/api/3/search?maxResults=${process.env.JIRA_MAX_SEARCH_RESULTS}&startAt=${startAt}&jql=${jql}`,
      {
        method: 'GET',
        headers: _getDefaultHeaders(),
        agent: httpsAgent,
      }
    );

    formattedRes = await response.json();
    issueList = issueList.concat(formattedRes.issues);

    if (startAt === 0) {
      pageCount = Math.ceil(formattedRes.total / formattedRes.maxResults);
    }

    startAt = startAt + formattedRes.maxResults;
    pageCount = pageCount - 1
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
