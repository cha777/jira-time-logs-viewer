interface Worklog {
  started: string;
  timeSpentSeconds: number;
  author: { emailAddress: string };
  issue: AdaptedIssue;
  updated: string;
}

interface AdaptedWorklog {
  started: string;
  timeSpentSeconds: number;
  author: string;
  key: string;
  summary: string;
  updated: string;
}
