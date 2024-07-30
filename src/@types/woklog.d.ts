interface Worklog {
  started: string;
  timeSpentSeconds: number;
  author: { emailAddress: string };
  issue: AdaptedIssue;
}

interface AdaptedWorklog {
  started: string;
  timeSpentSeconds: number;
  author: string;
  key: string;
  summary: string;
}
